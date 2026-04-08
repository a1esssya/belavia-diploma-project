import { OrderShowcase } from '@prisma/client';
type Eligibility = {
    available: boolean;
    reason?: string;
    requiresPayment?: boolean;
};
type ExchangeQuote = {
    pssQuoteId: string;
    amount: number;
    currency: string;
    changeFee: number;
    fareDifference: number;
    requiresPayment: boolean;
    expiresAt: Date;
};
type RefundQuote = {
    pssQuoteId: string;
    amount: number;
    currency: string;
    refundFee: number;
    expiresAt: Date;
};
export declare class MockLeonardoGateway {
    private readonly quoteTtlMinutes;
    getExchangeEligibility(order: OrderShowcase): Eligibility;
    getRefundEligibility(order: OrderShowcase): Eligibility;
    createExchangeQuote(order: OrderShowcase): ExchangeQuote;
    createRefundQuote(order: OrderShowcase): RefundQuote;
    commitExchange(order: OrderShowcase): {
        newDepartureAt: Date;
        newArrivalAt: Date | null;
        confirmationDocumentUrl: string;
    };
    commitRefund(order: OrderShowcase): {
        status: string;
        confirmationDocumentUrl: string;
    };
}
export {};
