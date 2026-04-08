import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(user: AuthenticatedUser): Promise<{
        id: string;
        pnr: string;
        ticketNumber: string;
        passenger: string;
        route: string;
        origin: string;
        destination: string;
        departureAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        amount: number;
        currency: string;
        exchange: {
            available: boolean;
            reason?: string;
            requiresPayment?: boolean;
        };
        refund: {
            available: boolean;
            reason?: string;
            requiresPayment?: boolean;
        };
    }[]>;
    findOne(user: AuthenticatedUser, orderId: string): Promise<{
        recentEvents: {
            id: string;
            type: string;
            message: string;
            createdAt: Date;
        }[];
        id: string;
        pnr: string;
        ticketNumber: string;
        passenger: {
            firstName: string;
            lastName: string;
            fullName: string;
        };
        itinerary: {
            route: string;
            origin: string;
            destination: string;
            departureAt: Date;
            arrivalAt: Date | null;
        };
        status: import(".prisma/client").$Enums.OrderStatus;
        amount: number;
        currency: string;
        exchange: {
            available: boolean;
            reason?: string;
            requiresPayment?: boolean;
        };
        refund: {
            available: boolean;
            reason?: string;
            requiresPayment?: boolean;
        };
        documents: {
            id: string;
            type: string;
            title: string;
            fileName: string;
            url: string;
            deliveryEmail: string;
            lastSentAt: Date | null;
        }[];
    }>;
}
