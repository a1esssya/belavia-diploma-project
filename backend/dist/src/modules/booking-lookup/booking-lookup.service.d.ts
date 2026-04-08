import { OrdersService } from '../orders/orders.service';
export declare class BookingLookupService {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    lookup(input: {
        pnr?: string;
        ticketNumber?: string;
        passengerLastName: string;
    }): Promise<{
        id: string;
        pnr: string;
        route: string;
        departureAt: Date;
        arrivalAt: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        passengerLastName: string;
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
    }>;
}
