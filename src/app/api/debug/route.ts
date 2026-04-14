import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL!;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    const adapter = new PrismaLibSql({
      url,
      ...(authToken ? { authToken } : {}),
    });

    const prisma = new PrismaClient({ adapter } as any);

    const user = await prisma.user.findUnique({
      where: { email: "admin@camp.com" },
    });

    await prisma.$disconnect();

    return NextResponse.json({
      ok: true,
      userFound: !!user,
      userId: user?.id,
      role: user?.role,
      isActive: user?.isActive,
      urlPrefix: url.substring(0, 40),
    });
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      name: e.constructor.name,
      tursoUrl: process.env.TURSO_DATABASE_URL?.substring(0, 40),
    });
  }
}
