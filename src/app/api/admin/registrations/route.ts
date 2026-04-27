import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any)?.role;
  const userId = (session.user as any)?.id as string | undefined;

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const camp = searchParams.get("camp");

  const where: Record<string, unknown> = {};
  if (camp === "kids" || camp === "teens") where.camp = camp;

  // Mentors can only see registrations assigned to teams they lead.
  if (role === "MENTOR") {
    if (!userId) return NextResponse.json({ registrations: [] });
    const myTeams = await prisma.team.findMany({
      where: { leaderId: userId },
      select: { id: true },
    });
    const teamIds = myTeams.map((t) => t.id);
    if (teamIds.length === 0) return NextResponse.json({ registrations: [] });
    where.teamId = { in: teamIds };
  }

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: parseInt(limit) } : {}),
  });

  return NextResponse.json({ registrations });
}
