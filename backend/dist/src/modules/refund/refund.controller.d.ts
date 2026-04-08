import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { RefundService } from './refund.service';
declare class RefundConfirmDto {
    quoteId: string;
}
export declare class RefundController {
    private readonly refundService;
    constructor(refundService: RefundService);
    createQuote(user: AuthenticatedUser, orderId: string): Promise<{
        id: string;
        orderId: string;
        pnr: string;
        status: import(".prisma/client").$Enums.OperationStatus;
        reason: string | null;
        quote: {
            amount: number;
            currency: string;
            refundFee: number;
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
    confirmQuote(user: AuthenticatedUser, orderId: string, body: RefundConfirmDto, idempotencyKey: string): Promise<{
        id: string;
        orderId: string;
        pnr: string;
        status: import(".prisma/client").$Enums.OperationStatus;
        reason: string | null;
        quote: {
            amount: number;
            currency: string;
            refundFee: number;
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
            refundFee: number;
            expiresAt: Date | null;
        };
        confirmedAt: Date | null;
        completedAt: Date | null;
        createdAt: Date;
    }>;
}
export {};
