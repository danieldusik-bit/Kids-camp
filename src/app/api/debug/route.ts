import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || "NOT_SET";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Step 1: Test raw libsql client
  try {
    const client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
    const result = await client.execute("SELECT COUNT(*) as cnt FROM User");
    const count = result.rows[0]?.cnt;

    return NextResponse.json({
      ok: true,
      step: "libsql direct query works",
      userCount: count,
      urlPrefix: url.substring(0, 40),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      step: "libsql direct query failed",
      error: e.message,
      urlPrefix: url.substring(0, 40),
      hasToken: !!authToken,
    });
  }
}
