import { NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";

export async function GET() {
  const rawUrl = process.env.TURSO_DATABASE_URL || "NOT_SET";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Convert libsql:// to https:// for web client
  const url = rawUrl.replace(/^libsql:\/\//, "https://");

  try {
    const client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
    const result = await client.execute("SELECT COUNT(*) as cnt FROM User");
    const count = result.rows[0]?.cnt;

    return NextResponse.json({
      ok: true,
      step: "libsql/web query works!",
      userCount: count,
      urlPrefix: url.substring(0, 50),
      rawUrlPrefix: rawUrl.substring(0, 50),
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      stack: e.stack?.substring(0, 300),
      urlPrefix: url.substring(0, 50),
      rawUrlPrefix: rawUrl.substring(0, 50),
      urlLength: rawUrl.length,
      urlLastChars: JSON.stringify(Array.from(rawUrl.slice(-5)).map(c => c.charCodeAt(0))),
      authTokenSet: !!authToken,
      authTokenLength: authToken?.length,
    });
  }
}
