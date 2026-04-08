import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { ExchangeService } from './exchange.service';
declare class ExchangeConfirmDto {
    quoteId: string;
}
export declare class ExchangeController {
    private readonly exchangeService;
    constructor(exchangeService: ExchangeService);
    createQuote(user: AuthenticatedUser, orderId: string): Promise<{
        id: string;
        orderId: string;
        pnr: string;
        status: import(".prisma/client").$Enums.OperationStatus;
        reason: string | null;
        quote: {
            amount: number;
            currency: string;
            changeFee: number;
            fareDifference: number;
            requiresPayment: boolean;
            expiresAt: Date | null;
        };
        confirmedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    } | {
        operationId: string;
        eligibility: {
            available: boolean;
            reason?: string;
            requiresPayment?: boolean;
        };
    }>;
    confirmQuote(user: AuthenticatedUser, orderId: string, body: ExchangeConfirmDto, idempotencyKey: string): Promise<{
        id: string;
        orderId: string;
        pnr: string;
        status: import(".prisma/client").$Enums.OperationStatus;
        reason: string | null;
        quote: {
            amount: number;
            currency: string;
            changeFee: number;
            fareDifference: number;
            requiresPayment: boolean;
            expiresAt: Date | null;
        };
        confirmedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
    getOperation(user: AuthenticatedUser, operationId: string): Promise<{
        id: string;
        orderId: string;
        pnr: string;
        status: import(".prisma/client").$Enums.OperationStatus;
        reason: string | null;
        quote: {
            amount: number;
            currency: string;
            changeFee: number;
            fareDifference: number;
            requiresPayment: boolean;
            expiresAt: Date | null;
        };
        confirmedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
}
export {};
