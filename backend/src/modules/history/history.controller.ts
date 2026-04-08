import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from '../orders/orders.service';
import { HistoryService } from './history.service';

@Controller('orders/:orderId/events')
@UseGuards(SessionAuthGuard)
export class HistoryController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly historyService: HistoryService,
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    await this.ordersService.assertOrderAccess(user.userId, orderId);
    return this.historyService.listForOrder(orderId);
  }
}
