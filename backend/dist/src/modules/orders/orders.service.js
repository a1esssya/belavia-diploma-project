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
const defaultBaggageSummary = {
    cabin: {
        pieces: 1,
        weightKg: 10,
    },
    checked: {
        pieces: 0,
        weightKg: 0,
    },
    extraPurchased: null,
};
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
        return links
            .map(({ order }) => this.toListView(order))
            .sort((left, right) => {
            const leftCancelled = left.status === 'CANCELLED';
            const rightCancelled = right.status === 'CANCELLED';
            if (leftCancelled !== rightCancelled) {
                return leftCancelled ? 1 : -1;
            }
            return new Date(left.departureAt).getTime() - new Date(right.departureAt).getTime();
        });
    }
    async findOneForUser(userId, orderId) {
        const order = await this.assertOrderAccess(userId, orderId);
        const events = await this.prisma.orderEvent.findMany({
            where: { orderId },
            orderBy: { createdAt: 'desc' },
            take: 3,
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
    async addBaggage(userId, orderId, optionId) {
        const order = await this.assertOrderAccess(userId, orderId);
        if (order.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Для отменённого заказа нельзя добавить багаж');
        }
        const option = this.mockLeonardoGateway.resolveBaggageOption(optionId);
        if (!option) {
            throw new common_1.BadRequestException('Выберите доступный вариант багажа');
        }
        const baggageSummary = this.parseBaggageSummary(order.baggageSummary);
        const ancillaries = this.parseAncillaries(order.ancillaries);
        const nextAncillaries = [
            ...ancillaries.filter((item) => item.type !== 'EXTRA_BAGGAGE'),
            {
                id: option.id,
                type: 'EXTRA_BAGGAGE',
                title: option.title,
                description: `${option.pieces} место, ${option.weightKg} кг`,
            },
        ];
        await this.prisma.orderShowcase.update({
            where: { id: order.id },
            data: {
                baggageSummary: {
                    ...baggageSummary,
                    extraPurchased: {
                        pieces: option.pieces,
                        weightKg: option.weightKg,
                    },
                },
                ancillaries: nextAncillaries,
            },
        });
        await this.prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: 'baggage.added',
                message: `Добавлен багаж: ${option.pieces} место, ${option.weightKg} кг`,
            },
        });
        return this.findOneForUser(userId, orderId);
    }
    async addAncillary(userId, orderId, optionId) {
        const order = await this.assertOrderAccess(userId, orderId);
        if (order.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Для отменённого заказа нельзя добавить услугу');
        }
        const option = this.mockLeonardoGateway.resolveServiceOption(optionId);
        if (!option) {
            throw new common_1.BadRequestException('Выберите доступную услугу');
        }
        const ancillaries = this.parseAncillaries(order.ancillaries);
        const nextAncillaries = [
            ...ancillaries.filter((item) => item.type !== option.type),
            {
                id: option.id,
                type: option.type,
                title: option.title,
                description: option.description,
            },
        ];
        await this.prisma.orderShowcase.update({
            where: { id: order.id },
            data: {
                ancillaries: nextAncillaries,
            },
        });
        await this.prisma.orderEvent.create({
            data: {
                orderId: order.id,
                type: option.type === 'SEAT' ? 'ancillary.seat.added' : 'ancillary.meal.added',
                message: option.type === 'SEAT'
                    ? `Добавлена услуга выбора места: ${option.description}`
                    : `Добавлено питание: ${option.description}`,
            },
        });
        return this.findOneForUser(userId, orderId);
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
            baggageSummary: this.parseBaggageSummary(order.baggageSummary),
            ancillaries: this.parseAncillaries(order.ancillaries),
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
    parseBaggageSummary(input) {
        var _a, _b, _c;
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            return defaultBaggageSummary;
        }
        const value = input;
        return {
            cabin: (_a = value.cabin) !== null && _a !== void 0 ? _a : defaultBaggageSummary.cabin,
            checked: (_b = value.checked) !== null && _b !== void 0 ? _b : defaultBaggageSummary.checked,
            extraPurchased: (_c = value.extraPurchased) !== null && _c !== void 0 ? _c : null,
        };
    }
    parseAncillaries(input) {
        if (!Array.isArray(input)) {
            return [];
        }
        return input.filter((item) => {
            return typeof item === 'object' && item !== null && 'id' in item && 'type' in item && 'title' in item && 'description' in item;
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_leonardo_gateway_1.MockLeonardoGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map