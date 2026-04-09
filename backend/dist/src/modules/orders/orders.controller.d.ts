import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from './orders.service';
declare class AddBaggageDto {
    optionId: string;
}
declare class AddAncillaryDto {
    optionId: string;
}
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
        baggageSummary: {
            cabin: {
                pieces: number;
                weightKg: number;
            };
            checked: {
                pieces: number;
                weightKg: number;
            };
            extraPurchased?: {
                pieces: number;
                weightKg: number;
            } | null;
        };
        ancillaries: {
            id: string;
            type: "SEAT" | "MEAL" | "EXTRA_BAGGAGE";
            title: string;
            description: string;
        }[];
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
    addBaggage(user: AuthenticatedUser, orderId: string, body: AddBaggageDto): Promise<{
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
        baggageSummary: {
            cabin: {
                pieces: number;
                weightKg: number;
            };
            checked: {
                pieces: number;
                weightKg: number;
            };
            extraPurchased?: {
                pieces: number;
                weightKg: number;
            } | null;
        };
        ancillaries: {
            id: string;
            type: "SEAT" | "MEAL" | "EXTRA_BAGGAGE";
            title: string;
            description: string;
        }[];
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
    addAncillary(user: AuthenticatedUser, orderId: string, body: AddAncillaryDto): Promise<{
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
        baggageSummary: {
            cabin: {
                pieces: number;
                weightKg: number;
            };
            checked: {
                pieces: number;
                weightKg: number;
            };
            extraPurchased?: {
                pieces: number;
                weightKg: number;
            } | null;
        };
        ancillaries: {
            id: string;
            type: "SEAT" | "MEAL" | "EXTRA_BAGGAGE";
            title: string;
            description: string;
        }[];
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
export {};
