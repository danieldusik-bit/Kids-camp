import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json({
      ok: true,
      step: "Prisma via web adapter works!",
      users,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      stack: e.stack?.substring(0, 500),
    });
  }
}
