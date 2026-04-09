import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { OrdersService } from './orders.service';

class AddBaggageDto {
  @IsString()
  optionId!: string;
}

class AddAncillaryDto {
  @IsString()
  optionId!: string;
}

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

  @Post(':orderId/baggage')
  addBaggage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: AddBaggageDto,
  ) {
    return this.ordersService.addBaggage(user.userId, orderId, body.optionId);
  }

  @Post(':orderId/ancillaries')
  addAncillary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: AddAncillaryDto,
  ) {
    return this.ordersService.addAncillary(user.userId, orderId, body.optionId);
  }
}
