import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [total, newCount, confirmed, rejected] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "Новая" } }),
    prisma.registration.count({ where: { status: "Подтверждена" } }),
    prisma.registration.count({ where: { status: "Отклонена" } }),
  ]);

  return NextResponse.json({ total, new: newCount, confirmed, rejected });
}
