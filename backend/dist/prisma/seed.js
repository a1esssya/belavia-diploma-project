"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createOrderSeed(userId, order) {
    const createdOrder = await prisma.orderShowcase.upsert({
        where: { pnr: order.pnr },
        update: {
            ...order,
            baggageSummary: order.baggageSummary,
            ancillaries: order.ancillaries,
            documents: {
                deleteMany: {},
                create: order.documents.map((document) => ({
                    ...document,
                    deliveryEmail: 'demo@belavia.by',
                    lastSentAt: new Date('2026-04-08T09:00:00Z'),
                })),
            },
            events: {
                deleteMany: {},
                create: order.events,
            },
        },
        create: {
            ...order,
            baggageSummary: order.baggageSummary,
            ancillaries: order.ancillaries,
            documents: {
                create: order.documents.map((document) => ({
                    ...document,
                    deliveryEmail: 'demo@belavia.by',
                    lastSentAt: new Date('2026-04-08T09:00:00Z'),
                })),
            },
            events: {
                create: order.events,
            },
        },
        include: {
            documents: true,
        },
    });
    await prisma.userOrderLink.upsert({
        where: {
            userId_orderId: {
                userId,
                orderId: createdOrder.id,
            },
        },
        update: {},
        create: {
            userId,
            orderId: createdOrder.id,
        },
    });
    return createdOrder;
}
async function main() {
    await prisma.idempotencyKey.deleteMany();
    await prisma.exchangeOperation.deleteMany();
    await prisma.refundOperation.deleteMany();
    await prisma.userOrderLink.deleteMany();
    await prisma.orderDocument.deleteMany();
    await prisma.orderEvent.deleteMany();
    await prisma.session.deleteMany();
    await prisma.orderShowcase.deleteMany();
    await prisma.user.deleteMany();
    const user = await prisma.user.create({
        data: {
            email: 'demo@belavia.by',
        },
    });
    const seededOrders = await Promise.all([
        createOrderSeed(user.id, {
            pnr: 'B2FLEX',
            ticketNumber: '421000000101',
            passengerFirstName: 'IVAN',
            passengerLastName: 'IVANOV',
            route: 'MSQ → IST',
            origin: 'MSQ',
            destination: 'IST',
            departureAt: new Date('2026-05-16T08:10:00Z'),
            arrivalAt: new Date('2026-05-16T12:15:00Z'),
            status: client_1.OrderStatus.UPCOMING,
            totalAmount: '185.00',
            baggageSummary: {
                cabin: { pieces: 1, weightKg: 10 },
                checked: { pieces: 1, weightKg: 23 },
                extraPurchased: null,
            },
            ancillaries: [
                {
                    id: 'seat-flex-window',
                    type: 'SEAT',
                    title: 'Выбор места',
                    description: 'Место 12A, у окна',
                },
            ],
            pssScenario: client_1.PssScenario.FLEXIBLE,
            documents: [
                {
                    type: client_1.DocumentType.ITINERARY,
                    title: 'Маршрут-квитанция',
                    fileName: 'B2FLEX-itinerary.pdf',
                    url: 'https://mock-leonardo.local/documents/B2FLEX-itinerary.pdf',
                },
                {
                    type: client_1.DocumentType.ETICKET,
                    title: 'Электронный билет',
                    fileName: '421000000101-eticket.pdf',
                    url: 'https://mock-leonardo.local/documents/421000000101-eticket.pdf',
                },
            ],
            events: [
                {
                    type: 'order.seeded',
                    message: 'Заказ загружен в личный кабинет',
                    createdAt: new Date('2026-04-08T08:00:00Z'),
                },
                {
                    type: 'documents.sent',
                    message: 'Документы отправлены на email',
                    createdAt: new Date('2026-04-08T08:30:00Z'),
                },
            ],
        }),
        createOrderSeed(user.id, {
            pnr: 'B2PAY1',
            ticketNumber: '421000000102',
            passengerFirstName: 'ANNA',
            passengerLastName: 'PETROVA',
            route: 'MSQ → TBS',
            origin: 'MSQ',
            destination: 'TBS',
            departureAt: new Date('2026-06-03T09:40:00Z'),
            arrivalAt: new Date('2026-06-03T13:20:00Z'),
            status: client_1.OrderStatus.UPCOMING,
            totalAmount: '240.00',
            baggageSummary: {
                cabin: { pieces: 1, weightKg: 10 },
                checked: { pieces: 1, weightKg: 23 },
                extraPurchased: null,
            },
            ancillaries: [
                {
                    id: 'meal-pay-special',
                    type: 'MEAL',
                    title: 'Дополнительное питание',
                    description: 'Горячее питание на борту',
                },
            ],
            pssScenario: client_1.PssScenario.EXCHANGE_SURCHARGE,
            documents: [
                {
                    type: client_1.DocumentType.ITINERARY,
                    title: 'Маршрут-квитанция',
                    fileName: 'B2PAY1-itinerary.pdf',
                    url: 'https://mock-leonardo.local/documents/B2PAY1-itinerary.pdf',
                },
                {
                    type: client_1.DocumentType.RECEIPT,
                    title: 'Квитанция об оплате',
                    fileName: 'B2PAY1-receipt.pdf',
                    url: 'https://mock-leonardo.local/documents/B2PAY1-receipt.pdf',
                },
            ],
            events: [
                {
                    type: 'order.seeded',
                    message: 'Заказ загружен в личный кабинет',
                    createdAt: new Date('2026-04-08T08:10:00Z'),
                },
                {
                    type: 'exchange.available',
                    message: 'Для заказа доступен обмен с возможной доплатой',
                    createdAt: new Date('2026-04-08T08:40:00Z'),
                },
            ],
        }),
        createOrderSeed(user.id, {
            pnr: 'B2NREF',
            ticketNumber: '421000000103',
            passengerFirstName: 'SERGEY',
            passengerLastName: 'SMIRNOV',
            route: 'MSQ → AYT',
            origin: 'MSQ',
            destination: 'AYT',
            departureAt: new Date('2026-07-11T05:30:00Z'),
            arrivalAt: new Date('2026-07-11T09:40:00Z'),
            status: client_1.OrderStatus.UPCOMING,
            totalAmount: '310.00',
            baggageSummary: {
                cabin: { pieces: 1, weightKg: 10 },
                checked: { pieces: 1, weightKg: 23 },
                extraPurchased: { pieces: 1, weightKg: 23 },
            },
            ancillaries: [
                {
                    id: 'bag-nref-extra',
                    type: 'EXTRA_BAGGAGE',
                    title: 'Дополнительный багаж',
                    description: '1 место, 23 кг',
                },
            ],
            pssScenario: client_1.PssScenario.REFUND_BLOCKED,
            documents: [
                {
                    type: client_1.DocumentType.ITINERARY,
                    title: 'Маршрут-квитанция',
                    fileName: 'B2NREF-itinerary.pdf',
                    url: 'https://mock-leonardo.local/documents/B2NREF-itinerary.pdf',
                },
            ],
            events: [
                {
                    type: 'order.seeded',
                    message: 'Заказ загружен в личный кабинет',
                    createdAt: new Date('2026-04-08T08:20:00Z'),
                },
                {
                    type: 'refund.blocked',
                    message: 'Возврат для тарифа ограничен правилами',
                    createdAt: new Date('2026-04-08T08:50:00Z'),
                },
            ],
        }),
        createOrderSeed(user.id, {
            pnr: 'B2CANC',
            ticketNumber: '421000000104',
            passengerFirstName: 'OLGA',
            passengerLastName: 'SOKOLOVA',
            route: 'MSQ → LED',
            origin: 'MSQ',
            destination: 'LED',
            departureAt: new Date('2026-03-15T06:00:00Z'),
            arrivalAt: new Date('2026-03-15T07:25:00Z'),
            status: client_1.OrderStatus.CANCELLED,
            totalAmount: '120.00',
            baggageSummary: {
                cabin: { pieces: 1, weightKg: 10 },
                checked: { pieces: 0, weightKg: 0 },
                extraPurchased: null,
            },
            ancillaries: [],
            pssScenario: client_1.PssScenario.CANCELLED_TRIP,
            documents: [
                {
                    type: client_1.DocumentType.ITINERARY,
                    title: 'Маршрут-квитанция',
                    fileName: 'B2CANC-itinerary.pdf',
                    url: 'https://mock-leonardo.local/documents/B2CANC-itinerary.pdf',
                },
            ],
            events: [
                {
                    type: 'order.cancelled',
                    message: 'Заказ отменён в mock PSS Leonardo',
                    createdAt: new Date('2026-03-14T18:00:00Z'),
                },
            ],
        }),
        createOrderSeed(user.id, {
            pnr: 'B2FAIL',
            ticketNumber: '421000000105',
            passengerFirstName: 'MARIA',
            passengerLastName: 'KOZLOVA',
            route: 'MSQ → DXB',
            origin: 'MSQ',
            destination: 'DXB',
            departureAt: new Date('2026-08-21T19:20:00Z'),
            arrivalAt: new Date('2026-08-22T01:10:00Z'),
            status: client_1.OrderStatus.UPCOMING,
            totalAmount: '420.00',
            baggageSummary: {
                cabin: { pieces: 1, weightKg: 10 },
                checked: { pieces: 1, weightKg: 23 },
                extraPurchased: null,
            },
            ancillaries: [],
            pssScenario: client_1.PssScenario.COMMIT_FAILURE,
            documents: [
                {
                    type: client_1.DocumentType.ITINERARY,
                    title: 'Маршрут-квитанция',
                    fileName: 'B2FAIL-itinerary.pdf',
                    url: 'https://mock-leonardo.local/documents/B2FAIL-itinerary.pdf',
                },
            ],
            events: [
                {
                    type: 'order.seeded',
                    message: 'Заказ загружен в личный кабинет',
                    createdAt: new Date('2026-04-08T08:25:00Z'),
                },
            ],
        }),
    ]);
    await prisma.exchangeOperation.create({
        data: {
            orderId: seededOrders[1].id,
            pssQuoteId: 'quote-seed-exchange-pay',
            quoteAmount: '120.00',
            currency: 'EUR',
            changeFee: '30.00',
            fareDifference: '90.00',
            requiresPayment: true,
            status: client_1.OperationStatus.QUOTED,
            expiresAt: new Date('2026-04-08T13:00:00Z'),
        },
    });
    await prisma.refundOperation.create({
        data: {
            orderId: seededOrders[2].id,
            pssQuoteId: 'quote-seed-refund-blocked',
            quoteAmount: '0.00',
            currency: 'EUR',
            refundFee: '0.00',
            status: client_1.OperationStatus.BLOCKED,
            reason: 'Тариф не допускает возврат',
            expiresAt: new Date('2026-04-08T13:00:00Z'),
        },
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map