import { BookingLookupService } from './booking-lookup.service';
declare class BookingLookupDto {
    pnr?: string;
    ticketNumber?: string;
    passengerLastName: string;
}
export declare class BookingLookupController {
    private readonly bookingLookupService;
    constructor(bookingLookupService: BookingLookupService);
    getHealth(): {
        module: string;
        status: string;
    };
    lookup(body: BookingLookupDto): Promise<{
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
export {};
