import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  const userId = (session.user as any)?.id as string | undefined;

  const registration = await prisma.registration.findUnique({
    where: { id: params.id },
  });

  if (!registration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mentors can only see registrations assigned to teams they lead.
  if (role === "MENTOR") {
    if (!registration.teamId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const team = await prisma.team.findUnique({
      where: { id: registration.teamId },
      select: { leaderId: true },
    });
    if (!team || team.leaderId !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(registration);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "SUPERADMIN" && role !== "MANAGER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status, internalNotes, teamId } = body;

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (internalNotes !== undefined) data.internalNotes = internalNotes;
  if (teamId !== undefined) data.teamId = teamId || null;

  const registration = await prisma.registration.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(registration);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  if (role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.registration.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
