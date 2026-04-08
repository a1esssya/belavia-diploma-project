import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
export declare class HistoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForOrder(orderId: string): Promise<{
        id: string;
        type: string;
        message: string;
        payload: Prisma.JsonValue;
        createdAt: Date;
    }[]>;
    addEvent(orderId: string, type: string, message: string, payload?: Prisma.InputJsonValue): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        payload: Prisma.JsonValue | null;
        orderId: string;
    }>;
}
