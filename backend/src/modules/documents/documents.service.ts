import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';
import { HistoryService } from '../history/history.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly historyService: HistoryService,
  ) {}

  async listForUserOrder(userId: string, orderId: string) {
    const order = await this.ordersService.assertOrderAccess(userId, orderId);

    const documents = await this.prisma.orderDocument.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });

    return documents.map((document) => ({
      id: document.id,
      type: document.type,
      title: document.title,
      fileName: document.fileName,
      url: document.url,
      deliveryEmail: document.deliveryEmail,
      lastSentAt: document.lastSentAt,
    }));
  }

  async resendForUserOrder(userId: string, orderId: string) {
    const order = await this.ordersService.assertOrderAccess(userId, orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Для отменённого заказа повторная отправка документов недоступна');
    }

    const now = new Date();

    await this.prisma.orderDocument.updateMany({
      where: { orderId: order.id },
      data: { lastSentAt: now },
    });

    await this.historyService.addEvent(
      order.id,
      'documents.resent',
      'Документы повторно отправлены на e-mail',
      { deliveryEmail: 'demo@belavia.by' },
    );

    const documents = await this.prisma.orderDocument.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      success: true,
      deliveryEmail: 'demo@belavia.by',
      documents: documents.map((document) => ({
        id: document.id,
        type: document.type,
        title: document.title,
        lastSentAt: document.lastSentAt,
      })),
    };
  }
}
