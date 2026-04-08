import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderShowcase } from '@prisma/client';

import { PrismaService } from '../../common/prisma.service';
import { MockLeonardoGateway } from '../integrations/gateway/mock-leonardo.gateway';

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

  toDetailView(order: OrderShowcase & { documents?: Array<{ id: string; type: string; title: string; fileName: string; url: string; lastSentAt: Date | null; deliveryEmail: string }> }) {
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
}
