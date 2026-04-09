import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomInt } from 'node:crypto';

import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async startLogin(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const otpCode = `${randomInt(0, 1_000_000)}`.padStart(6, '0');
    const otpTtlSeconds = Number(process.env.OTP_TTL_SECONDS ?? 300);
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

  async verifyLogin(email: string, loginSessionId: string, otpCode: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const session = await this.prisma.session.findUnique({
      where: { id: loginSessionId },
      include: { user: true },
    });

    if (!session || session.user.email !== normalizedEmail) {
      throw new NotFoundException('Сессия входа не найдена');
    }

    if (session.verifiedAt) {
      throw new BadRequestException('Код подтверждения уже использован');
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Срок действия кода подтверждения истёк');
    }

    if (session.otpCode !== otpCode) {
      throw new UnauthorizedException('Неверный код подтверждения');
    }

    const accessToken = randomBytes(24).toString('hex');
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

  async logout(accessToken: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        accessToken,
        revokedAt: null,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Активная сессия не найдена');
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orderLinks: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      id: user.id,
      email: user.email,
      ordersCount: user.orderLinks.length,
      createdAt: user.createdAt,
    };
  }
}
