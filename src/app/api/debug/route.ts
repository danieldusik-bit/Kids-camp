import { NextResponse } from "next/server";

export async function GET() {
  const envInfo = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL?.substring(0, 40) || "NOT SET",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET (" + process.env.TURSO_AUTH_TOKEN.length + " chars)" : "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    DATABASE_URL: process.env.DATABASE_URL?.substring(0, 40) || "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envInfo);
}
