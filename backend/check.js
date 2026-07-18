const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ include: { role: true } });
    console.log("USERS:", JSON.stringify(users, null, 2));
    const roles = await prisma.role.findMany();
    console.log("ROLES:", JSON.stringify(roles, null, 2));
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error("FULL:", err);
  }
}
main().finally(() => process.exit(0));
