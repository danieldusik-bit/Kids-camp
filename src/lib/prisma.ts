import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPromise: Promise<PrismaClient> | undefined;
};

async function createPrismaClient(): Promise<PrismaClient> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    // Production: use the web-compatible adapter for Vercel serverless
    const { PrismaLibSql } = await import("@prisma/adapter-libsql/web");
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({ adapter } as any);
  }

  // Local development: use node adapter with file-based SQLite
  const { PrismaLibSql } = await import("@prisma/adapter-libsql");
  const adapter = new PrismaLibSql({ url: "file:dev.db" });
  return new PrismaClient({ adapter } as any);
}

function getPrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return Promise.resolve(globalForPrisma.prisma);
  }
  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createPrismaClient().then((client) => {
      globalForPrisma.prisma = client;
      return client;
    });
  }
  return globalForPrisma.prismaPromise;
}

// Export a proxy that auto-awaits the prisma promise on property access
// This way consumers can use `prisma.user.findMany()` without await on prisma itself
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Return a function/property that first resolves the client
    if (prop === "then" || prop === Symbol.toPrimitive) {
      return undefined; // Prevent treating proxy as thenable
    }
    return new Proxy(function () {}, {
      get(_t, subProp) {
        return async (...args: any[]) => {
          const client = await getPrisma();
          return (client as any)[prop][subProp](...args);
        };
      },
      apply: async (_t, _thisArg, args) => {
        const client = await getPrisma();
        return (client as any)[prop](...args);
      },
    });
  },
});
