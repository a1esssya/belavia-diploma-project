"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SessionAuthGuard = class SessionAuthGuard {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers.authorization;
        const bearerToken = typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')
            ? authorizationHeader.slice('Bearer '.length).trim()
            : undefined;
        const headerToken = request.headers['x-session-token'];
        const token = bearerToken !== null && bearerToken !== void 0 ? bearerToken : (typeof headerToken === 'string' ? headerToken : Array.isArray(headerToken) ? headerToken[0] : undefined);
        if (!token) {
            throw new common_1.UnauthorizedException('Требуется access token');
        }
        const session = await this.prisma.session.findFirst({
            where: {
                accessToken: token,
                verifiedAt: { not: null },
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: {
                user: true,
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Сессия недействительна или истекла');
        }
        request.user = {
            sessionId: session.id,
            userId: session.userId,
            email: session.user.email,
            accessToken: token,
        };
        return true;
    }
};
exports.SessionAuthGuard = SessionAuthGuard;
exports.SessionAuthGuard = SessionAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionAuthGuard);
//# sourceMappingURL=session-auth.guard.js.map