import { Injectable } from '@nestjs/common';

import { OrdersService } from '../orders/orders.service';

@Injectable()
export class BookingLookupService {
  constructor(private readonly ordersService: OrdersService) {}

  async lookup(input: { pnr?: string; ticketNumber?: string; passengerLastName: string }) {
    return this.ordersService.findForBookingLookup(input);
  }
}
