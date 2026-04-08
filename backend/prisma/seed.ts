import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.upsert({
    where: { pnr: 'AB1234' },
    update: {},
    create: {
      pnr: 'AB1234',
      status: 'BOOKED',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
