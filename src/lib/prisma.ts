import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || "file:dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("[PRISMA] Creating client with URL prefix:", url.substring(0, 30));
  console.log("[PRISMA] Has auth token:", !!authToken);

  const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
  });

  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
