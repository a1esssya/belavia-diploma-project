import { PrismaService } from '../../common/prisma.service';
import { HistoryService } from '../history/history.service';
import { OrdersService } from '../orders/orders.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly ordersService;
    private readonly historyService;
    constructor(prisma: PrismaService, ordersService: OrdersService, historyService: HistoryService);
    listForUserOrder(userId: string, orderId: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.DocumentType;
        title: string;
        fileName: string;
        url: string;
        deliveryEmail: string;
        lastSentAt: Date | null;
    }[]>;
    resendForUserOrder(userId: string, orderId: string): Promise<{
        success: boolean;
        deliveryEmail: string;
        documents: {
            id: string;
            type: import(".prisma/client").$Enums.DocumentType;
            title: string;
            lastSentAt: Date | null;
        }[];
    }>;
}
