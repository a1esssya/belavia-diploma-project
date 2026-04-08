import { OrderShowcase } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';
export declare class OrdersService {
    private readonly prisma;
    private readonly mockLeonardoGateway;
    constructor(prisma: PrismaService, mockLeonardoGateway: MockLeonardoGateway);
    assertOrderAccess(userId: string, orderId: string): Promise<{
        documents: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.DocumentType;
            title: string;
            fileName: string;
            deliveryEmail: string;
            url: string;
            lastSentAt: Date | null;
            orderId: string;
        }[];
    } & {
        id: string;
        pnr: string;
        ticketNumber: string;
        passengerFirstName: string;
        passengerLastName: string;
        route: string;
        origin: string;
        destination: string;
        departureAt: Date;
        arrivalAt: Date | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        currency: string;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        pssScenario: import(".prisma/client").$Enums.PssScenario;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findForUser(userId: string): Promise<{
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
    findOneForUser(userId: string, orderId: string): Promise<{
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
    findForBookingLookup(input: {
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
    toListView(order: OrderShowcase): {
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
    };
    toDetailView(order: OrderShowcase & {
        documents?: Array<{
            id: string;
            type: string;
            title: string;
            fileName: string;
            url: string;
            lastSentAt: Date | null;
            deliveryEmail: string;
        }>;
    }): {
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
    };
}
