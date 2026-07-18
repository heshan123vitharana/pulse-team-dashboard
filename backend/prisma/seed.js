const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find existing Manager role and update to Administrator
  const managerRole = await prisma.role.findFirst({
    where: { role_name: 'Manager' }
  });

  if (managerRole) {
    await prisma.role.update({
      where: { id: managerRole.id },
      data: { role_name: 'Administrator' }
    });
    console.log('Renamed Manager role to Administrator');
  } else {
    // If it doesn't exist, upsert Administrator
    await prisma.role.upsert({
      where: { role_name: 'Administrator' },
      update: {},
      create: { role_name: 'Administrator' }
    });
    console.log('Ensured Administrator role exists');
  }

  // Ensure Project Manager role exists
  await prisma.role.upsert({
    where: { role_name: 'Project Manager' },
    update: {},
    create: { role_name: 'Project Manager' }
  });
  console.log('Ensured Project Manager role exists');

  // Ensure Team Member role exists
  await prisma.role.upsert({
    where: { role_name: 'Team Member' },
    update: {},
    create: { role_name: 'Team Member' }
  });
  console.log('Ensured Team Member role exists');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
