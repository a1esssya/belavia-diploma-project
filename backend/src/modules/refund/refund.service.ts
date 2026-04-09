import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, OperationStatus, OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';
import { HistoryService } from '../history/history.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class RefundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly historyService: HistoryService,
    private readonly mockLeonardoGateway: MockLeonardoGateway,
  ) {}

  async createQuote(userId: string, orderId: string) {
    const order = await this.ordersService.assertOrderAccess(userId, orderId);
    const eligibility = this.mockLeonardoGateway.getRefundEligibility(order);

    if (!eligibility.available) {
      const blockedOperation = await this.prisma.refundOperation.create({
        data: {
          orderId: order.id,
          pssQuoteId: `blocked-${order.id}-${Date.now()}`,
          quoteAmount: new Prisma.Decimal(0),
          currency: order.currency,
          refundFee: new Prisma.Decimal(0),
          status: OperationStatus.BLOCKED,
          reason: eligibility.reason,
        },
      });

      return {
        operationId: blockedOperation.id,
        eligibility,
      };
    }

    const quote = this.mockLeonardoGateway.createRefundQuote(order);
    const operation = await this.prisma.refundOperation.create({
      data: {
        orderId: order.id,
        pssQuoteId: quote.pssQuoteId,
        quoteAmount: new Prisma.Decimal(quote.amount),
        currency: quote.currency,
        refundFee: new Prisma.Decimal(quote.refundFee),
        status: quote.expiresAt <= new Date() ? OperationStatus.EXPIRED : OperationStatus.QUOTED,
        expiresAt: quote.expiresAt,
        reason: quote.expiresAt <= new Date() ? 'Срок действия расчёта истёк' : null,
      },
    });

    return this.getOperationView(operation.id, userId);
  }

  async confirmQuote(userId: string, orderId: string, quoteId: string, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Требуется заголовок Idempotency-Key');
    }

    const existingKey = await this.prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      if (existingKey.operation !== 'refund.confirm' || existingKey.orderId !== orderId) {
        throw new ConflictException('Idempotency-Key уже используется для другой операции');
      }

      if (!existingKey.responseRef) {
        throw new ConflictException('Операция уже выполняется');
      }

      return this.getOperationView(existingKey.responseRef, userId);
    }

    const order = await this.ordersService.assertOrderAccess(userId, orderId);
    const operation = await this.prisma.refundOperation.findFirst({
      where: {
        id: quoteId,
        orderId: order.id,
      },
    });

    if (!operation) {
      throw new NotFoundException('Расчёт возврата не найден');
    }

    if (operation.status === OperationStatus.BLOCKED) {
      throw new BadRequestException(operation.reason ?? 'Возврат недоступен');
    }

    if (operation.status !== OperationStatus.QUOTED && operation.status !== OperationStatus.EXPIRED) {
      throw new BadRequestException('Расчёт уже обработан');
    }

    await this.prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        operation: 'refund.confirm',
        orderId: order.id,
      },
    });

    if (operation.expiresAt && operation.expiresAt <= new Date()) {
      await this.prisma.refundOperation.update({
        where: { id: operation.id },
        data: {
          status: OperationStatus.EXPIRED,
          reason: 'Срок действия расчёта истёк',
          idempotencyKey,
        },
      });

      await this.historyService.addEvent(
        order.id,
        'refund.expired',
        'Подтверждение возврата отклонено: срок действия расчёта истёк',
      );

      await this.prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { responseRef: operation.id },
      });

      return this.getOperationView(operation.id, userId);
    }

    try {
      const pssResult = this.mockLeonardoGateway.commitRefund(order);
      const completedOperation = await this.prisma.$transaction(async (tx) => {
        const updatedOperation = await tx.refundOperation.update({
          where: { id: operation.id },
          data: {
            status: OperationStatus.SUCCEEDED,
            confirmedAt: new Date(),
            completedAt: new Date(),
            idempotencyKey,
            reason: null,
          },
        });

        await tx.orderShowcase.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
          },
        });

        await tx.orderDocument.create({
          data: {
            orderId: order.id,
            type: DocumentType.REFUND_CONFIRMATION,
            title: 'Подтверждение возврата',
            fileName: `${order.pnr}-refund-confirmation.pdf`,
            deliveryEmail: 'demo@belavia.by',
            url: pssResult.confirmationDocumentUrl,
            lastSentAt: new Date(),
          },
        });

        await tx.idempotencyKey.update({
          where: { key: idempotencyKey },
          data: { responseRef: updatedOperation.id },
        });

        return updatedOperation;
      });

      await this.historyService.addEvent(
        order.id,
        'refund.confirmed',
        'Возврат билета подтверждён',
        {
          operationId: completedOperation.id,
          amount: Number(completedOperation.quoteAmount),
        },
      );

      return this.getOperationView(completedOperation.id, userId);
    } catch (error) {
      const failedOperation = await this.prisma.refundOperation.update({
        where: { id: operation.id },
        data: {
          status: OperationStatus.FAILED,
          confirmedAt: new Date(),
          completedAt: new Date(),
          idempotencyKey,
          reason: error instanceof Error ? error.message : 'Не удалось подтвердить возврат',
        },
      });

      await this.prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { responseRef: failedOperation.id },
      });

      await this.historyService.addEvent(
        order.id,
        'refund.failed',
        failedOperation.reason ?? 'Возврат завершился ошибкой',
      );

      return this.getOperationView(failedOperation.id, userId);
    }
  }

  async getOperationView(operationId: string, userId: string) {
    const operation = await this.prisma.refundOperation.findUnique({
      where: { id: operationId },
      include: { order: true },
    });

    if (!operation) {
      throw new NotFoundException('Операция возврата не найдена');
    }

    await this.ordersService.assertOrderAccess(userId, operation.orderId);

    return {
      id: operation.id,
      orderId: operation.orderId,
      pnr: operation.order.pnr,
      status: operation.status,
      reason: operation.reason,
      quote: {
        amount: Number(operation.quoteAmount),
        currency: operation.currency,
        refundFee: Number(operation.refundFee),
        expiresAt: operation.expiresAt,
      },
      confirmedAt: operation.confirmedAt,
      completedAt: operation.completedAt,
      createdAt: operation.createdAt,
    };
  }
}
