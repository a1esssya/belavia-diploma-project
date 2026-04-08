import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async listForOrder(orderId: string) {
    const order = await this.prisma.orderShowcase.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    const events = await this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => ({
      id: event.id,
      type: event.type,
      message: event.message,
      payload: event.payload,
      createdAt: event.createdAt,
    }));
  }

  async addEvent(
    orderId: string,
    type: string,
    message: string,
    payload?: Prisma.InputJsonValue,
  ) {
    return this.prisma.orderEvent.create({
      data: {
        orderId,
        type,
        message,
        ...(payload ? { payload } : {}),
      },
    });
  }
}
