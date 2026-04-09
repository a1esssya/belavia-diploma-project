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

type BaggageOption = {
  id: string;
  title: string;
  pieces: number;
  weightKg: number;
};

type ServiceOption = {
  id: string;
  type: 'SEAT' | 'MEAL';
  title: string;
  description: string;
};

@Injectable()
export class MockLeonardoGateway {
  private readonly quoteTtlMinutes = 15;
  private readonly baggageOptions: BaggageOption[] = [
    {
      id: 'bag-extra-23',
      title: 'Дополнительный багаж',
      pieces: 1,
      weightKg: 23,
    },
    {
      id: 'bag-extra-32',
      title: 'Увеличенный багаж',
      pieces: 1,
      weightKg: 32,
    },
  ];
  private readonly serviceOptions: ServiceOption[] = [
    {
      id: 'seat-window-12a',
      type: 'SEAT',
      title: 'Выбор места',
      description: 'Место 12A, у окна',
    },
    {
      id: 'meal-hot',
      type: 'MEAL',
      title: 'Дополнительное питание',
      description: 'Горячее питание на борту',
    },
  ];

  getExchangeEligibility(order: OrderShowcase): Eligibility {
    switch (order.pssScenario) {
      case PssScenario.CANCELLED_TRIP:
        return { available: false, reason: 'Обмен недоступен, потому что заказ отменён.' };
      case PssScenario.PAST_TRIP:
        return { available: false, reason: 'Обмен недоступен после вылета.' };
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
        return { available: false, reason: 'Возврат недоступен, потому что заказ отменён.' };
      case PssScenario.PAST_TRIP:
        return { available: false, reason: 'Возврат недоступен после вылета.' };
      case PssScenario.REFUND_BLOCKED:
        return { available: false, reason: 'Тариф не допускает возврат.' };
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

  resolveBaggageOption(optionId: string) {
    return this.baggageOptions.find((option) => option.id === optionId) ?? null;
  }

  resolveServiceOption(optionId: string) {
    return this.serviceOptions.find((option) => option.id === optionId) ?? null;
  }
}
