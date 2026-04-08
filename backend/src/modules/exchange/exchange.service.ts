import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, OperationStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';
import { HistoryService } from '../history/history.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ExchangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
    private readonly historyService: HistoryService,
    private readonly mockLeonardoGateway: MockLeonardoGateway,
  ) {}

  async createQuote(userId: string, orderId: string) {
    const order = await this.ordersService.assertOrderAccess(userId, orderId);
    const eligibility = this.mockLeonardoGateway.getExchangeEligibility(order);

    if (!eligibility.available) {
      const blockedOperation = await this.prisma.exchangeOperation.create({
        data: {
          orderId: order.id,
          pssQuoteId: `blocked-${order.id}-${Date.now()}`,
          quoteAmount: new Prisma.Decimal(0),
          currency: order.currency,
          changeFee: new Prisma.Decimal(0),
          fareDifference: new Prisma.Decimal(0),
          requiresPayment: false,
          status: OperationStatus.BLOCKED,
          reason: eligibility.reason,
        },
      });

      await this.historyService.addEvent(
        order.id,
        'exchange.blocked',
        eligibility.reason ?? 'Обмен недоступен',
      );

      return {
        operationId: blockedOperation.id,
        eligibility,
      };
    }

    const quote = this.mockLeonardoGateway.createExchangeQuote(order);
    const operation = await this.prisma.exchangeOperation.create({
      data: {
        orderId: order.id,
        pssQuoteId: quote.pssQuoteId,
        quoteAmount: new Prisma.Decimal(quote.amount),
        currency: quote.currency,
        changeFee: new Prisma.Decimal(quote.changeFee),
        fareDifference: new Prisma.Decimal(quote.fareDifference),
        requiresPayment: quote.requiresPayment,
        status: quote.expiresAt <= new Date() ? OperationStatus.EXPIRED : OperationStatus.QUOTED,
        expiresAt: quote.expiresAt,
        reason: quote.expiresAt <= new Date() ? 'Срок действия quote истёк' : null,
      },
    });

    await this.historyService.addEvent(
      order.id,
      'exchange.quote_created',
      'Расчёт обмена подготовлен',
      {
        operationId: operation.id,
        amount: quote.amount,
        requiresPayment: quote.requiresPayment,
      },
    );

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
      if (existingKey.operation !== 'exchange.confirm' || existingKey.orderId !== orderId) {
        throw new ConflictException('Idempotency-Key уже используется для другой операции');
      }

      if (!existingKey.responseRef) {
        throw new ConflictException('Операция уже выполняется');
      }

      return this.getOperationView(existingKey.responseRef, userId);
    }

    const order = await this.ordersService.assertOrderAccess(userId, orderId);
    const operation = await this.prisma.exchangeOperation.findFirst({
      where: {
        id: quoteId,
        orderId: order.id,
      },
    });

    if (!operation) {
      throw new NotFoundException('Exchange quote не найден');
    }

    if (operation.status === OperationStatus.BLOCKED) {
      throw new BadRequestException(operation.reason ?? 'Обмен недоступен');
    }

    if (operation.status !== OperationStatus.QUOTED && operation.status !== OperationStatus.EXPIRED) {
      throw new BadRequestException('Quote уже обработан');
    }

    await this.prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        operation: 'exchange.confirm',
        orderId: order.id,
      },
    });

    if (operation.expiresAt && operation.expiresAt <= new Date()) {
      await this.prisma.exchangeOperation.update({
        where: { id: operation.id },
        data: {
          status: OperationStatus.EXPIRED,
          reason: 'Срок действия quote истёк',
          idempotencyKey,
        },
      });

      await this.historyService.addEvent(
        order.id,
        'exchange.expired',
        'Подтверждение обмена отклонено: quote истёк',
      );

      await this.prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { responseRef: operation.id },
      });

      return this.getOperationView(operation.id, userId);
    }

    try {
      const pssResult = this.mockLeonardoGateway.commitExchange(order);
      const completedOperation = await this.prisma.$transaction(async (tx) => {
        const updatedOperation = await tx.exchangeOperation.update({
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
            departureAt: pssResult.newDepartureAt,
            arrivalAt: pssResult.newArrivalAt ?? undefined,
            totalAmount: new Prisma.Decimal(Number(order.totalAmount) + Number(operation.quoteAmount)),
          },
        });

        await tx.orderDocument.create({
          data: {
            orderId: order.id,
            type: DocumentType.EXCHANGE_CONFIRMATION,
            title: 'Подтверждение обмена',
            fileName: `${order.pnr}-exchange-confirmation.pdf`,
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
        'exchange.confirmed',
        'Обмен успешно подтверждён',
        {
          operationId: completedOperation.id,
          amount: Number(completedOperation.quoteAmount),
        },
      );

      return this.getOperationView(completedOperation.id, userId);
    } catch (error) {
      const failedOperation = await this.prisma.exchangeOperation.update({
        where: { id: operation.id },
        data: {
          status: OperationStatus.FAILED,
          confirmedAt: new Date(),
          completedAt: new Date(),
          idempotencyKey,
          reason: error instanceof Error ? error.message : 'Не удалось подтвердить обмен',
        },
      });

      await this.prisma.idempotencyKey.update({
        where: { key: idempotencyKey },
        data: { responseRef: failedOperation.id },
      });

      await this.historyService.addEvent(
        order.id,
        'exchange.failed',
        failedOperation.reason ?? 'Обмен завершился ошибкой',
      );

      return this.getOperationView(failedOperation.id, userId);
    }
  }

  async getOperationView(operationId: string, userId: string) {
    const operation = await this.prisma.exchangeOperation.findUnique({
      where: { id: operationId },
      include: { order: true },
    });

    if (!operation) {
      throw new NotFoundException('Exchange operation не найдена');
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
        changeFee: Number(operation.changeFee),
        fareDifference: Number(operation.fareDifference),
        requiresPayment: operation.requiresPayment,
        expiresAt: operation.expiresAt,
      },
      confirmedAt: operation.confirmedAt,
      completedAt: operation.completedAt,
      createdAt: operation.createdAt,
    };
  }
}
