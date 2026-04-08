import { PrismaService } from '../../common/prisma.service';
import { HistoryService } from '../history/history.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';
import { OrdersService } from '../orders/orders.service';
export declare class RefundService {
    private readonly prisma;
    private readonly ordersService;
    private readonly historyService;
    private readonly mockLeonardoGateway;
    constructor(prisma: PrismaService, ordersService: OrdersService, historyService: HistoryService, mockLeonardoGateway: MockLeonardoGateway);
    createQuote(userId: string, orderId: string): Promise<{
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
    confirmQuote(userId: string, orderId: string, quoteId: string, idempotencyKey: string): Promise<{
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
    getOperationView(operationId: string, userId: string): Promise<{
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
