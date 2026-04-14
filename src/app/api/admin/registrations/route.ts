import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: parseInt(limit) } : {}),
  });

  return NextResponse.json({ registrations });
}
