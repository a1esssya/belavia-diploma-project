import { PrismaService } from '../../common/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    startLogin(email: string): Promise<{
        loginSessionId: string;
        email: string;
        otpExpiresAt: Date;
        deliveryChannel: string;
        otpDebugCode: string | undefined;
    }>;
    verifyLogin(email: string, loginSessionId: string, otpCode: string): Promise<{
        accessToken: string;
        expiresAt: Date;
        user: {
            id: string;
            email: string;
        };
    }>;
    logout(accessToken: string): Promise<{
        success: boolean;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        ordersCount: number;
        createdAt: Date;
    }>;
}
