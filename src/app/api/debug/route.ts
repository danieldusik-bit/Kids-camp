import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as bcryptModule from "bcryptjs";

const bcrypt = (bcryptModule as any).default || bcryptModule;

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@camp.com" },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in DB", dbConnected: true });
    }

    const bcryptKeys = Object.keys(bcrypt);
    const hasCompare = typeof bcrypt.compare === "function";

    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare("Admin1234!", user.passwordHash);
    } catch (e: any) {
      return NextResponse.json({
        error: "bcrypt.compare threw",
        message: e.message,
        bcryptKeys,
        hasCompare,
        userFound: true,
        hashPrefix: user.passwordHash?.substring(0, 10),
      });
    }

    return NextResponse.json({
      userFound: true,
      userId: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isActiveType: typeof user.isActive,
      hashPrefix: user.passwordHash?.substring(0, 10),
      hashLength: user.passwordHash?.length,
      passwordMatch,
      bcryptKeys,
      hasCompare,
      envCheck: {
        hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
        hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) });
  }
}
