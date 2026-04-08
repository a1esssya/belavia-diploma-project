export interface AuthenticatedUser {
    sessionId: string;
    userId: string;
    email: string;
    accessToken: string;
}
