import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from './authenticated-user.interface';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      user?: AuthenticatedUser;
    }>();

    const authorizationHeader = request.headers.authorization;
    const bearerToken =
      typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')
        ? authorizationHeader.slice('Bearer '.length).trim()
        : undefined;
    const headerToken = request.headers['x-session-token'];
    const token =
      bearerToken ??
      (typeof headerToken === 'string' ? headerToken : Array.isArray(headerToken) ? headerToken[0] : undefined);

    if (!token) {
      throw new UnauthorizedException('Требуется access token');
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
      throw new UnauthorizedException('Сессия недействительна или истекла');
    }

    request.user = {
      sessionId: session.id,
      userId: session.userId,
      email: session.user.email,
      accessToken: token,
    };

    return true;
  }
}
