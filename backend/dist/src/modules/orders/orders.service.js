"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma.service");
const mock_leonardo_gateway_1 = require("../integrations/gateway/mock-leonardo.gateway");
let OrdersService = class OrdersService {
    constructor(prisma, mockLeonardoGateway) {
        this.prisma = prisma;
        this.mockLeonardoGateway = mockLeonardoGateway;
    }
    async assertOrderAccess(userId, orderId) {
        const link = await this.prisma.userOrderLink.findUnique({
            where: {
                userId_orderId: {
                    userId,
                    orderId,
                },
            },
            include: {
                order: {
                    include: {
                        documents: true,
                    },
                },
            },
        });
        if (!link) {
            throw new common_1.ForbiddenException('Нет доступа к заказу');
        }
        return link.order;
    }
    async findForUser(userId) {
        const links = await this.prisma.userOrderLink.findMany({
            where: { userId },
            include: {
                order: true,
            },
            orderBy: {
                order: {
                    departureAt: 'asc',
                },
            },
        });
        return links.map(({ order }) => this.toListView(order));
    }
    async findOneForUser(userId, orderId) {
        const order = await this.assertOrderAccess(userId, orderId);
        const events = await this.prisma.orderEvent.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        return {
            ...this.toDetailView(order),
            recentEvents: events.map((event) => ({
                id: event.id,
                type: event.type,
                message: event.message,
                createdAt: event.createdAt,
            })),
        };
    }
    async findForBookingLookup(input) {
        const order = await this.prisma.orderShowcase.findFirst({
            where: {
                passengerLastName: { equals: input.passengerLastName, mode: 'insensitive' },
                ...(input.pnr ? { pnr: input.pnr.toUpperCase() } : {}),
                ...(input.ticketNumber ? { ticketNumber: input.ticketNumber } : {}),
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Бронирование не найдено');
        }
        return {
            id: order.id,
            pnr: order.pnr,
            route: order.route,
            departureAt: order.departureAt,
            arrivalAt: order.arrivalAt,
            status: order.status,
            passengerLastName: order.passengerLastName,
            exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
            refund: this.mockLeonardoGateway.getRefundEligibility(order),
        };
    }
    toListView(order) {
        return {
            id: order.id,
            pnr: order.pnr,
            ticketNumber: order.ticketNumber,
            passenger: `${order.passengerFirstName} ${order.passengerLastName}`,
            route: order.route,
            origin: order.origin,
            destination: order.destination,
            departureAt: order.departureAt,
            status: order.status,
            amount: Number(order.totalAmount),
            currency: order.currency,
            exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
            refund: this.mockLeonardoGateway.getRefundEligibility(order),
        };
    }
    toDetailView(order) {
        var _a, _b;
        return {
            id: order.id,
            pnr: order.pnr,
            ticketNumber: order.ticketNumber,
            passenger: {
                firstName: order.passengerFirstName,
                lastName: order.passengerLastName,
                fullName: `${order.passengerFirstName} ${order.passengerLastName}`,
            },
            itinerary: {
                route: order.route,
                origin: order.origin,
                destination: order.destination,
                departureAt: order.departureAt,
                arrivalAt: order.arrivalAt,
            },
            status: order.status,
            amount: Number(order.totalAmount),
            currency: order.currency,
            exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
            refund: this.mockLeonardoGateway.getRefundEligibility(order),
            documents: (_b = (_a = order.documents) === null || _a === void 0 ? void 0 : _a.map((document) => ({
                id: document.id,
                type: document.type,
                title: document.title,
                fileName: document.fileName,
                url: document.url,
                deliveryEmail: document.deliveryEmail,
                lastSentAt: document.lastSentAt,
            }))) !== null && _b !== void 0 ? _b : [],
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_leonardo_gateway_1.MockLeonardoGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map