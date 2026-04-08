import { Injectable } from '@nestjs/common';
import { OrderShowcase, PssScenario } from '@prisma/client';

type Eligibility = {
  available: boolean;
  reason?: string;
  requiresPayment?: boolean;
};

type ExchangeQuote = {
  pssQuoteId: string;
  amount: number;
  currency: string;
  changeFee: number;
  fareDifference: number;
  requiresPayment: boolean;
  expiresAt: Date;
};

type RefundQuote = {
  pssQuoteId: string;
  amount: number;
  currency: string;
  refundFee: number;
  expiresAt: Date;
};

@Injectable()
export class MockLeonardoGateway {
  private readonly quoteTtlMinutes = 15;

  getExchangeEligibility(order: OrderShowcase): Eligibility {
    switch (order.pssScenario) {
      case PssScenario.CANCELLED_TRIP:
        return { available: false, reason: 'Заказ уже отменён' };
      case PssScenario.PAST_TRIP:
        return { available: false, reason: 'Обмен недоступен после вылета' };
      case PssScenario.REFUND_BLOCKED:
      case PssScenario.FLEXIBLE:
      case PssScenario.QUOTE_EXPIRED:
      case PssScenario.COMMIT_FAILURE:
        return { available: true, requiresPayment: false };
      case PssScenario.EXCHANGE_SURCHARGE:
        return { available: true, requiresPayment: true };
    }
  }

  getRefundEligibility(order: OrderShowcase): Eligibility {
    switch (order.pssScenario) {
      case PssScenario.CANCELLED_TRIP:
        return { available: false, reason: 'Заказ уже отменён' };
      case PssScenario.PAST_TRIP:
        return { available: false, reason: 'Возврат недоступен после вылета' };
      case PssScenario.REFUND_BLOCKED:
        return { available: false, reason: 'Тариф не допускает возврат' };
      case PssScenario.FLEXIBLE:
      case PssScenario.EXCHANGE_SURCHARGE:
      case PssScenario.QUOTE_EXPIRED:
      case PssScenario.COMMIT_FAILURE:
        return { available: true };
    }
  }

  createExchangeQuote(order: OrderShowcase): ExchangeQuote {
    const expiresAt =
      order.pssScenario === PssScenario.QUOTE_EXPIRED
        ? new Date(Date.now() - 60_000)
        : new Date(Date.now() + this.quoteTtlMinutes * 60_000);

    if (order.pssScenario === PssScenario.EXCHANGE_SURCHARGE) {
      return {
        pssQuoteId: `L-${order.pnr}-EX-${Date.now()}`,
        amount: 120,
        currency: order.currency,
        changeFee: 30,
        fareDifference: 90,
        requiresPayment: true,
        expiresAt,
      };
    }

    return {
      pssQuoteId: `L-${order.pnr}-EX-${Date.now()}`,
      amount: 0,
      currency: order.currency,
      changeFee: 0,
      fareDifference: 0,
      requiresPayment: false,
      expiresAt,
    };
  }

  createRefundQuote(order: OrderShowcase): RefundQuote {
    const expiresAt =
      order.pssScenario === PssScenario.QUOTE_EXPIRED
        ? new Date(Date.now() - 60_000)
        : new Date(Date.now() + this.quoteTtlMinutes * 60_000);

    if (order.pssScenario === PssScenario.EXCHANGE_SURCHARGE) {
      return {
        pssQuoteId: `L-${order.pnr}-RF-${Date.now()}`,
        amount: Number(order.totalAmount) - 40,
        currency: order.currency,
        refundFee: 40,
        expiresAt,
      };
    }

    return {
      pssQuoteId: `L-${order.pnr}-RF-${Date.now()}`,
      amount: Math.max(Number(order.totalAmount) - 20, 0),
      currency: order.currency,
      refundFee: 20,
      expiresAt,
    };
  }

  commitExchange(order: OrderShowcase) {
    if (order.pssScenario === PssScenario.COMMIT_FAILURE) {
      throw new Error('Mock PSS Leonardo не подтвердил обмен');
    }

    const shiftDays = order.pssScenario === PssScenario.EXCHANGE_SURCHARGE ? 2 : 1;
    const newDepartureAt = new Date(order.departureAt.getTime() + shiftDays * 24 * 60 * 60 * 1000);
    const newArrivalAt = order.arrivalAt
      ? new Date(order.arrivalAt.getTime() + shiftDays * 24 * 60 * 60 * 1000)
      : null;

    return {
      newDepartureAt,
      newArrivalAt,
      confirmationDocumentUrl: `https://mock-leonardo.local/documents/${order.pnr}-exchange-confirmation.pdf`,
    };
  }

  commitRefund(order: OrderShowcase) {
    if (order.pssScenario === PssScenario.COMMIT_FAILURE) {
      throw new Error('Mock PSS Leonardo не подтвердил возврат');
    }

    return {
      status: 'cancelled',
      confirmationDocumentUrl: `https://mock-leonardo.local/documents/${order.pnr}-refund-confirmation.pdf`,
    };
  }
}
