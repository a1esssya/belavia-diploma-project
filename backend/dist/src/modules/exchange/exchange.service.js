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
exports.ExchangeService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma.service");
const history_service_1 = require("../history/history.service");
const mock_leonardo_gateway_1 = require("../integrations/gateway/mock-leonardo.gateway");
const orders_service_1 = require("../orders/orders.service");
let ExchangeService = class ExchangeService {
    constructor(prisma, ordersService, historyService, mockLeonardoGateway) {
        this.prisma = prisma;
        this.ordersService = ordersService;
        this.historyService = historyService;
        this.mockLeonardoGateway = mockLeonardoGateway;
    }
    async createQuote(userId, orderId) {
        const order = await this.ordersService.assertOrderAccess(userId, orderId);
        const eligibility = this.mockLeonardoGateway.getExchangeEligibility(order);
        if (!eligibility.available) {
            const blockedOperation = await this.prisma.exchangeOperation.create({
                data: {
                    orderId: order.id,
                    pssQuoteId: `blocked-${order.id}-${Date.now()}`,
                    quoteAmount: new client_1.Prisma.Decimal(0),
                    currency: order.currency,
                    changeFee: new client_1.Prisma.Decimal(0),
                    fareDifference: new client_1.Prisma.Decimal(0),
                    requiresPayment: false,
                    status: client_1.OperationStatus.BLOCKED,
                    reason: eligibility.reason,
                },
            });
            return {
                operationId: blockedOperation.id,
                eligibility,
            };
        }
        const quote = this.mockLeonardoGateway.createExchangeQuote(order);
        const operation = await this.prisma.exchangeOperation.create({
            data: {
                orderId: order.id,
                pssQuoteId: quote.pssQuoteId,
                quoteAmount: new client_1.Prisma.Decimal(quote.amount),
                currency: quote.currency,
                changeFee: new client_1.Prisma.Decimal(quote.changeFee),
                fareDifference: new client_1.Prisma.Decimal(quote.fareDifference),
                requiresPayment: quote.requiresPayment,
                status: quote.expiresAt <= new Date() ? client_1.OperationStatus.EXPIRED : client_1.OperationStatus.QUOTED,
                expiresAt: quote.expiresAt,
                reason: quote.expiresAt <= new Date() ? 'Срок действия расчёта истёк' : null,
            },
        });
        return this.getOperationView(operation.id, userId);
    }
    async confirmQuote(userId, orderId, quoteId, idempotencyKey) {
        var _a, _b;
        if (!idempotencyKey) {
            throw new common_1.BadRequestException('Требуется заголовок Idempotency-Key');
        }
        const existingKey = await this.prisma.idempotencyKey.findUnique({
            where: { key: idempotencyKey },
        });
        if (existingKey) {
            if (existingKey.operation !== 'exchange.confirm' || existingKey.orderId !== orderId) {
                throw new common_1.ConflictException('Idempotency-Key уже используется для другой операции');
            }
            if (!existingKey.responseRef) {
                throw new common_1.ConflictException('Операция уже выполняется');
            }
            return this.getOperationView(existingKey.responseRef, userId);
        }
        const order = await this.ordersService.assertOrderAccess(userId, orderId);
        const operation = await this.prisma.exchangeOperation.findFirst({
            where: {
                id: quoteId,
                orderId: order.id,
            },
        });
        if (!operation) {
            throw new common_1.NotFoundException('Расчёт обмена не найден');
        }
        if (operation.status === client_1.OperationStatus.BLOCKED) {
            throw new common_1.BadRequestException((_a = operation.reason) !== null && _a !== void 0 ? _a : 'Обмен недоступен');
        }
        if (operation.status !== client_1.OperationStatus.QUOTED && operation.status !== client_1.OperationStatus.EXPIRED) {
            throw new common_1.BadRequestException('Расчёт уже обработан');
        }
        await this.prisma.idempotencyKey.create({
            data: {
                key: idempotencyKey,
                operation: 'exchange.confirm',
                orderId: order.id,
            },
        });
        if (operation.expiresAt && operation.expiresAt <= new Date()) {
            await this.prisma.exchangeOperation.update({
                where: { id: operation.id },
                data: {
                    status: client_1.OperationStatus.EXPIRED,
                    reason: 'Срок действия расчёта истёк',
                    idempotencyKey,
                },
            });
            await this.historyService.addEvent(order.id, 'exchange.expired', 'Подтверждение обмена отклонено: срок действия расчёта истёк');
            await this.prisma.idempotencyKey.update({
                where: { key: idempotencyKey },
                data: { responseRef: operation.id },
            });
            return this.getOperationView(operation.id, userId);
        }
        try {
            const pssResult = this.mockLeonardoGateway.commitExchange(order);
            const completedOperation = await this.prisma.$transaction(async (tx) => {
                var _a;
                const updatedOperation = await tx.exchangeOperation.update({
                    where: { id: operation.id },
                    data: {
                        status: client_1.OperationStatus.SUCCEEDED,
                        confirmedAt: new Date(),
                        completedAt: new Date(),
                        idempotencyKey,
                        reason: null,
                    },
                });
                await tx.orderShowcase.update({
                    where: { id: order.id },
                    data: {
                        departureAt: pssResult.newDepartureAt,
                        arrivalAt: (_a = pssResult.newArrivalAt) !== null && _a !== void 0 ? _a : undefined,
                        totalAmount: new client_1.Prisma.Decimal(Number(order.totalAmount) + Number(operation.quoteAmount)),
                    },
                });
                await tx.orderDocument.create({
                    data: {
                        orderId: order.id,
                        type: client_1.DocumentType.EXCHANGE_CONFIRMATION,
                        title: 'Подтверждение обмена',
                        fileName: `${order.pnr}-exchange-confirmation.pdf`,
                        deliveryEmail: 'demo@belavia.by',
                        url: pssResult.confirmationDocumentUrl,
                        lastSentAt: new Date(),
                    },
                });
                await tx.idempotencyKey.update({
                    where: { key: idempotencyKey },
                    data: { responseRef: updatedOperation.id },
                });
                return updatedOperation;
            });
            await this.historyService.addEvent(order.id, 'exchange.confirmed', 'Обмен билета подтверждён', {
                operationId: completedOperation.id,
                amount: Number(completedOperation.quoteAmount),
            });
            return this.getOperationView(completedOperation.id, userId);
        }
        catch (error) {
            const failedOperation = await this.prisma.exchangeOperation.update({
                where: { id: operation.id },
                data: {
                    status: client_1.OperationStatus.FAILED,
                    confirmedAt: new Date(),
                    completedAt: new Date(),
                    idempotencyKey,
                    reason: error instanceof Error ? error.message : 'Не удалось подтвердить обмен',
                },
            });
            await this.prisma.idempotencyKey.update({
                where: { key: idempotencyKey },
                data: { responseRef: failedOperation.id },
            });
            await this.historyService.addEvent(order.id, 'exchange.failed', (_b = failedOperation.reason) !== null && _b !== void 0 ? _b : 'Обмен завершился ошибкой');
            return this.getOperationView(failedOperation.id, userId);
        }
    }
    async getOperationView(operationId, userId) {
        const operation = await this.prisma.exchangeOperation.findUnique({
            where: { id: operationId },
            include: { order: true },
        });
        if (!operation) {
            throw new common_1.NotFoundException('Операция обмена не найдена');
        }
        await this.ordersService.assertOrderAccess(userId, operation.orderId);
        return {
            id: operation.id,
            orderId: operation.orderId,
            pnr: operation.order.pnr,
            status: operation.status,
            reason: operation.reason,
            quote: {
                amount: Number(operation.quoteAmount),
                currency: operation.currency,
                changeFee: Number(operation.changeFee),
                fareDifference: Number(operation.fareDifference),
                requiresPayment: operation.requiresPayment,
                expiresAt: operation.expiresAt,
            },
            confirmedAt: operation.confirmedAt,
            completedAt: operation.completedAt,
            createdAt: operation.createdAt,
        };
    }
};
exports.ExchangeService = ExchangeService;
exports.ExchangeService = ExchangeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orders_service_1.OrdersService,
        history_service_1.HistoryService,
        mock_leonardo_gateway_1.MockLeonardoGateway])
], ExchangeService);
//# sourceMappingURL=exchange.service.js.map