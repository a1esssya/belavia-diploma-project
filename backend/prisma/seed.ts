import { OrderStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@belavia.by' },
    update: {},
    create: { email: 'demo@belavia.by' },
  });

  const orders = [
    {
      pnr: 'B2UP01',
      ticketNumber: '421000000001',
      passengerLastName: 'IVANOV',
      route: 'MSQ → IST',
      status: OrderStatus.UPCOMING,
      departureAt: new Date('2026-05-16T08:10:00Z'),
    },
    {
      pnr: 'B2UP02',
      ticketNumber: '421000000002',
      passengerLastName: 'PETROVA',
      route: 'MSQ → TBS',
      status: OrderStatus.UPCOMING,
      departureAt: new Date('2026-06-03T09:40:00Z'),
    },
    {
      pnr: 'B2PA01',
      ticketNumber: '421000000003',
      passengerLastName: 'SMIRNOV',
      route: 'MSQ → AYT',
      status: OrderStatus.PAST,
      departureAt: new Date('2025-11-10T12:00:00Z'),
    },
  ];

  for (const order of orders) {
    const createdOrder = await prisma.orderShowcase.upsert({
      where: { pnr: order.pnr },
      update: order,
      create: order,
    });

    await prisma.userOrderLink.upsert({
      where: { userId_orderId: { userId: user.id, orderId: createdOrder.id } },
      update: {},
      create: { userId: user.id, orderId: createdOrder.id },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: createdOrder.id,
        type: 'seed.bootstrap',
        message: 'Initial showcase state created for prototype',
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
