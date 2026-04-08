import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { AuthService } from './auth.service';
declare class LoginStartDto {
    email: string;
}
declare class LoginVerifyDto {
    email: string;
    loginSessionId: string;
    otpCode: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    getHealth(): {
        module: string;
        status: string;
    };
    startLogin(body: LoginStartDto): Promise<{
        loginSessionId: string;
        email: string;
        otpExpiresAt: Date;
        deliveryChannel: string;
        otpDebugCode: string | undefined;
    }>;
    verifyLogin(body: LoginVerifyDto): Promise<{
        accessToken: string;
        expiresAt: Date;
        user: {
            id: string;
            email: string;
        };
    }>;
    logout(user: AuthenticatedUser, request: {
        headers: Record<string, string | string[] | undefined>;
    }): Promise<{
        success: boolean;
    }>;
    getMe(user: AuthenticatedUser): Promise<{
        id: string;
        email: string;
        ordersCount: number;
        createdAt: Date;
    }>;
}
export {};
