import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  const userId = (session.user as any)?.id as string | undefined;

  const where =
    role === "MENTOR" && userId ? { leaderId: userId } : {};

  const teams = await prisma.team.findMany({
    where,
    orderBy: [{ camp: "asc" }, { gender: "asc" }, { number: "asc" }],
  });
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session || (role !== "SUPERADMIN" && role !== "MANAGER"))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const camp = body.camp;
  const gender = body.gender;
  const number = parseInt(body.number);
  if (
    (camp !== "kids" && camp !== "teens") ||
    (gender !== "boy" && gender !== "girl") ||
    !Number.isInteger(number) ||
    number < 1 ||
    number > 99
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const team = await prisma.team.create({
      data: {
        camp,
        gender,
        number,
        name: body.name || "",
        leaderId: body.leaderId || null,
      },
    });
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json(
      { error: "Команда с таким номером уже существует" },
      { status: 400 }
    );
  }
}
