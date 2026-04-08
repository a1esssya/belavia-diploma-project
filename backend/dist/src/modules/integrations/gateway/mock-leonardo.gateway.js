"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLeonardoGateway = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let MockLeonardoGateway = class MockLeonardoGateway {
    constructor() {
        this.quoteTtlMinutes = 15;
    }
    getExchangeEligibility(order) {
        switch (order.pssScenario) {
            case client_1.PssScenario.CANCELLED_TRIP:
                return { available: false, reason: 'Заказ уже отменён' };
            case client_1.PssScenario.PAST_TRIP:
                return { available: false, reason: 'Обмен недоступен после вылета' };
            case client_1.PssScenario.REFUND_BLOCKED:
            case client_1.PssScenario.FLEXIBLE:
            case client_1.PssScenario.QUOTE_EXPIRED:
            case client_1.PssScenario.COMMIT_FAILURE:
                return { available: true, requiresPayment: false };
            case client_1.PssScenario.EXCHANGE_SURCHARGE:
                return { available: true, requiresPayment: true };
        }
    }
    getRefundEligibility(order) {
        switch (order.pssScenario) {
            case client_1.PssScenario.CANCELLED_TRIP:
                return { available: false, reason: 'Заказ уже отменён' };
            case client_1.PssScenario.PAST_TRIP:
                return { available: false, reason: 'Возврат недоступен после вылета' };
            case client_1.PssScenario.REFUND_BLOCKED:
                return { available: false, reason: 'Тариф не допускает возврат' };
            case client_1.PssScenario.FLEXIBLE:
            case client_1.PssScenario.EXCHANGE_SURCHARGE:
            case client_1.PssScenario.QUOTE_EXPIRED:
            case client_1.PssScenario.COMMIT_FAILURE:
                return { available: true };
        }
    }
    createExchangeQuote(order) {
        const expiresAt = order.pssScenario === client_1.PssScenario.QUOTE_EXPIRED
            ? new Date(Date.now() - 60000)
            : new Date(Date.now() + this.quoteTtlMinutes * 60000);
        if (order.pssScenario === client_1.PssScenario.EXCHANGE_SURCHARGE) {
            return {
                pssQuoteId: `L-${order.pnr}-EX-${Date.now()}`,
                amount: 120,
                currency: order.currency,
                changeFee: 30,
                fareDifference: 90,
                requiresPayment: true,
                expiresAt,
            };
        }
        return {
            pssQuoteId: `L-${order.pnr}-EX-${Date.now()}`,
            amount: 0,
            currency: order.currency,
            changeFee: 0,
            fareDifference: 0,
            requiresPayment: false,
            expiresAt,
        };
    }
    createRefundQuote(order) {
        const expiresAt = order.pssScenario === client_1.PssScenario.QUOTE_EXPIRED
            ? new Date(Date.now() - 60000)
            : new Date(Date.now() + this.quoteTtlMinutes * 60000);
        if (order.pssScenario === client_1.PssScenario.EXCHANGE_SURCHARGE) {
            return {
                pssQuoteId: `L-${order.pnr}-RF-${Date.now()}`,
                amount: Number(order.totalAmount) - 40,
                currency: order.currency,
                refundFee: 40,
                expiresAt,
            };
        }
        return {
            pssQuoteId: `L-${order.pnr}-RF-${Date.now()}`,
            amount: Math.max(Number(order.totalAmount) - 20, 0),
            currency: order.currency,
            refundFee: 20,
            expiresAt,
        };
    }
    commitExchange(order) {
        if (order.pssScenario === client_1.PssScenario.COMMIT_FAILURE) {
            throw new Error('Mock PSS Leonardo не подтвердил обмен');
        }
        const shiftDays = order.pssScenario === client_1.PssScenario.EXCHANGE_SURCHARGE ? 2 : 1;
        const newDepartureAt = new Date(order.departureAt.getTime() + shiftDays * 24 * 60 * 60 * 1000);
        const newArrivalAt = order.arrivalAt
            ? new Date(order.arrivalAt.getTime() + shiftDays * 24 * 60 * 60 * 1000)
            : null;
        return {
            newDepartureAt,
            newArrivalAt,
            confirmationDocumentUrl: `https://mock-leonardo.local/documents/${order.pnr}-exchange-confirmation.pdf`,
        };
    }
    commitRefund(order) {
        if (order.pssScenario === client_1.PssScenario.COMMIT_FAILURE) {
            throw new Error('Mock PSS Leonardo не подтвердил возврат');
        }
        return {
            status: 'cancelled',
            confirmationDocumentUrl: `https://mock-leonardo.local/documents/${order.pnr}-refund-confirmation.pdf`,
        };
    }
};
exports.MockLeonardoGateway = MockLeonardoGateway;
exports.MockLeonardoGateway = MockLeonardoGateway = __decorate([
    (0, common_1.Injectable)()
], MockLeonardoGateway);
//# sourceMappingURL=mock-leonardo.gateway.js.map