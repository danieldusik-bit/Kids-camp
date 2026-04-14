import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const passwordHash = await bcrypt.hash("Admin1234!", 10);

  await prisma.user.upsert({
    where: { email: "admin@camp.com" },
    update: {},
    create: {
      name: "Суперадмин",
      email: "admin@camp.com",
      passwordHash,
      role: "SUPERADMIN",
      isActive: true,
    },
  });

  console.log("Seed completed: superadmin created (admin@camp.com / Admin1234!)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
