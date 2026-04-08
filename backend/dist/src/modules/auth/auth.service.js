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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../../common/prisma.service");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startLogin(email) {
        var _a;
        const normalizedEmail = email.trim().toLowerCase();
        const otpCode = `${(0, node_crypto_1.randomInt)(0, 1000000)}`.padStart(6, '0');
        const otpTtlSeconds = Number((_a = process.env.OTP_TTL_SECONDS) !== null && _a !== void 0 ? _a : 300);
        const expiresAt = new Date(Date.now() + otpTtlSeconds * 1000);
        const user = await this.prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {},
            create: { email: normalizedEmail },
        });
        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                otpCode,
                expiresAt,
            },
        });
        return {
            loginSessionId: session.id,
            email: normalizedEmail,
            otpExpiresAt: expiresAt,
            deliveryChannel: 'email-mock',
            otpDebugCode: process.env.NODE_ENV === 'production' ? undefined : otpCode,
        };
    }
    async verifyLogin(email, loginSessionId, otpCode) {
        const normalizedEmail = email.trim().toLowerCase();
        const session = await this.prisma.session.findUnique({
            where: { id: loginSessionId },
            include: { user: true },
        });
        if (!session || session.user.email !== normalizedEmail) {
            throw new common_1.NotFoundException('Сессия входа не найдена');
        }
        if (session.verifiedAt) {
            throw new common_1.BadRequestException('OTP уже подтверждён');
        }
        if (session.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException('Срок действия OTP истёк');
        }
        if (session.otpCode !== otpCode) {
            throw new common_1.UnauthorizedException('Неверный OTP-код');
        }
        const accessToken = (0, node_crypto_1.randomBytes)(24).toString('hex');
        const accessExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const verifiedSession = await this.prisma.session.update({
            where: { id: session.id },
            data: {
                accessToken,
                verifiedAt: new Date(),
                expiresAt: accessExpiresAt,
            },
            include: {
                user: true,
            },
        });
        return {
            accessToken,
            expiresAt: verifiedSession.expiresAt,
            user: {
                id: verifiedSession.user.id,
                email: verifiedSession.user.email,
            },
        };
    }
    async logout(accessToken) {
        const session = await this.prisma.session.findFirst({
            where: {
                accessToken,
                revokedAt: null,
            },
        });
        if (!session) {
            throw new common_1.UnauthorizedException('Активная сессия не найдена');
        }
        await this.prisma.session.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                orderLinks: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Пользователь не найден');
        }
        return {
            id: user.id,
            email: user.email,
            ordersCount: user.orderLinks.length,
            createdAt: user.createdAt,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map