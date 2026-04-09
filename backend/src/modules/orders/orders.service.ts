import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderShowcase, Prisma } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';

type BaggageSummary = {
  cabin: {
    pieces: number;
    weightKg: number;
  };
  checked: {
    pieces: number;
    weightKg: number;
  };
  extraPurchased?: {
    pieces: number;
    weightKg: number;
  } | null;
};

type AncillaryItem = {
  id: string;
  type: 'SEAT' | 'MEAL' | 'EXTRA_BAGGAGE';
  title: string;
  description: string;
};

type OrderWithRelations = OrderShowcase & {
  documents?: Array<{
    id: string;
    type: string;
    title: string;
    fileName: string;
    url: string;
    lastSentAt: Date | null;
    deliveryEmail: string;
  }>;
};

const defaultBaggageSummary: BaggageSummary = {
  cabin: {
    pieces: 1,
    weightKg: 10,
  },
  checked: {
    pieces: 0,
    weightKg: 0,
  },
  extraPurchased: null,
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockLeonardoGateway: MockLeonardoGateway,
  ) {}

  async assertOrderAccess(userId: string, orderId: string) {
    const link = await this.prisma.userOrderLink.findUnique({
      where: {
        userId_orderId: {
          userId,
          orderId,
        },
      },
      include: {
        order: {
          include: {
            documents: true,
          },
        },
      },
    });

    if (!link) {
      throw new ForbiddenException('Нет доступа к заказу');
    }

    return link.order;
  }

  async findForUser(userId: string) {
    const links = await this.prisma.userOrderLink.findMany({
      where: { userId },
      include: {
        order: true,
      },
      orderBy: {
        order: {
          departureAt: 'asc',
        },
      },
    });

    return links.map(({ order }) => this.toListView(order));
  }

  async findOneForUser(userId: string, orderId: string) {
    const order = await this.assertOrderAccess(userId, orderId);
    const events = await this.prisma.orderEvent.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      ...this.toDetailView(order),
      recentEvents: events.map((event) => ({
        id: event.id,
        type: event.type,
        message: event.message,
        createdAt: event.createdAt,
      })),
    };
  }

  async findForBookingLookup(input: { pnr?: string; ticketNumber?: string; passengerLastName: string }) {
    const order = await this.prisma.orderShowcase.findFirst({
      where: {
        passengerLastName: { equals: input.passengerLastName, mode: 'insensitive' },
        ...(input.pnr ? { pnr: input.pnr.toUpperCase() } : {}),
        ...(input.ticketNumber ? { ticketNumber: input.ticketNumber } : {}),
      },
    });

    if (!order) {
      throw new NotFoundException('Бронирование не найдено');
    }

    return {
      id: order.id,
      pnr: order.pnr,
      route: order.route,
      departureAt: order.departureAt,
      arrivalAt: order.arrivalAt,
      status: order.status,
      passengerLastName: order.passengerLastName,
      exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
      refund: this.mockLeonardoGateway.getRefundEligibility(order),
    };
  }

  async addBaggage(userId: string, orderId: string, optionId: string) {
    const order = await this.assertOrderAccess(userId, orderId);

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Для отменённого заказа нельзя добавить багаж');
    }

    const option = this.mockLeonardoGateway.resolveBaggageOption(optionId);

    if (!option) {
      throw new BadRequestException('Выберите доступный вариант багажа');
    }

    const baggageSummary = this.parseBaggageSummary(order.baggageSummary);
    const ancillaries = this.parseAncillaries(order.ancillaries);
    const nextAncillaries = [
      ...ancillaries.filter((item) => item.type !== 'EXTRA_BAGGAGE'),
      {
        id: option.id,
        type: 'EXTRA_BAGGAGE',
        title: option.title,
        description: `${option.pieces} место, ${option.weightKg} кг`,
      } satisfies AncillaryItem,
    ];

    await this.prisma.orderShowcase.update({
      where: { id: order.id },
      data: {
        baggageSummary: {
          ...baggageSummary,
          extraPurchased: {
            pieces: option.pieces,
            weightKg: option.weightKg,
          },
        } as Prisma.InputJsonValue,
        ancillaries: nextAncillaries as Prisma.InputJsonValue,
      },
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'baggage.added',
        message: `Добавлен багаж: ${option.pieces} место, ${option.weightKg} кг`,
      },
    });

    return this.findOneForUser(userId, orderId);
  }

  async addAncillary(userId: string, orderId: string, optionId: string) {
    const order = await this.assertOrderAccess(userId, orderId);

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Для отменённого заказа нельзя добавить услугу');
    }

    const option = this.mockLeonardoGateway.resolveServiceOption(optionId);

    if (!option) {
      throw new BadRequestException('Выберите доступную услугу');
    }

    const ancillaries = this.parseAncillaries(order.ancillaries);
    const nextAncillaries = [
      ...ancillaries.filter((item) => item.type !== option.type),
      {
        id: option.id,
        type: option.type,
        title: option.title,
        description: option.description,
      } satisfies AncillaryItem,
    ];

    await this.prisma.orderShowcase.update({
      where: { id: order.id },
      data: {
        ancillaries: nextAncillaries as Prisma.InputJsonValue,
      },
    });

    await this.prisma.orderEvent.create({
      data: {
        orderId: order.id,
        type: option.type === 'SEAT' ? 'ancillary.seat.added' : 'ancillary.meal.added',
        message:
          option.type === 'SEAT'
            ? `Добавлена услуга выбора места: ${option.description}`
            : `Добавлено питание: ${option.description}`,
      },
    });

    return this.findOneForUser(userId, orderId);
  }

  toListView(order: OrderShowcase) {
    return {
      id: order.id,
      pnr: order.pnr,
      ticketNumber: order.ticketNumber,
      passenger: `${order.passengerFirstName} ${order.passengerLastName}`,
      route: order.route,
      origin: order.origin,
      destination: order.destination,
      departureAt: order.departureAt,
      status: order.status,
      amount: Number(order.totalAmount),
      currency: order.currency,
      exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
      refund: this.mockLeonardoGateway.getRefundEligibility(order),
    };
  }

  toDetailView(order: OrderWithRelations) {
    return {
      id: order.id,
      pnr: order.pnr,
      ticketNumber: order.ticketNumber,
      passenger: {
        firstName: order.passengerFirstName,
        lastName: order.passengerLastName,
        fullName: `${order.passengerFirstName} ${order.passengerLastName}`,
      },
      itinerary: {
        route: order.route,
        origin: order.origin,
        destination: order.destination,
        departureAt: order.departureAt,
        arrivalAt: order.arrivalAt,
      },
      status: order.status,
      amount: Number(order.totalAmount),
      currency: order.currency,
      exchange: this.mockLeonardoGateway.getExchangeEligibility(order),
      refund: this.mockLeonardoGateway.getRefundEligibility(order),
      baggageSummary: this.parseBaggageSummary(order.baggageSummary),
      ancillaries: this.parseAncillaries(order.ancillaries),
      documents:
        order.documents?.map((document) => ({
          id: document.id,
          type: document.type,
          title: document.title,
          fileName: document.fileName,
          url: document.url,
          deliveryEmail: document.deliveryEmail,
          lastSentAt: document.lastSentAt,
        })) ?? [],
    };
  }

  private parseBaggageSummary(input: Prisma.JsonValue | null): BaggageSummary {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return defaultBaggageSummary;
    }

    const value = input as Partial<BaggageSummary>;

    return {
      cabin: value.cabin ?? defaultBaggageSummary.cabin,
      checked: value.checked ?? defaultBaggageSummary.checked,
      extraPurchased: value.extraPurchased ?? null,
    };
  }

  private parseAncillaries(input: Prisma.JsonValue | null): AncillaryItem[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input.filter((item): item is AncillaryItem => {
      return typeof item === 'object' && item !== null && 'id' in item && 'type' in item && 'title' in item && 'description' in item;
    });
  }
}
