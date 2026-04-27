import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "SUPERADMIN" && role !== "MANAGER"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if ("leaderId" in body) data.leaderId = body.leaderId || null;

  const team = await prisma.team.update({ where: { id }, data });
  return NextResponse.json({ team });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || role !== "SUPERADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  // Unassign children from this team first
  await prisma.registration.updateMany({
    where: { teamId: id },
    data: { teamId: null },
  });
  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
