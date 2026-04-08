import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const result = await this.prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;

    return {
      status: 'ok',
      database: result[0]?.result === 1 ? 'connected' : 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
}
