import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from '../orders/orders.service';
import { HistoryService } from './history.service';
export declare class HistoryController {
    private readonly ordersService;
    private readonly historyService;
    constructor(ordersService: OrdersService, historyService: HistoryService);
    list(user: AuthenticatedUser, orderId: string): Promise<{
        id: string;
        type: string;
        message: string;
        payload: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
    }[]>;
}
