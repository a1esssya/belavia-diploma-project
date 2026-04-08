import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(SessionAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ordersService.findForUser(user.userId);
  }

  @Get(':orderId')
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.ordersService.findOneForUser(user.userId, orderId);
  }
}
