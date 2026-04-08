import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsString } from 'class-validator';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { ExchangeService } from './exchange.service';

class ExchangeConfirmDto {
  @IsString()
  quoteId!: string;
}

@Controller()
@UseGuards(SessionAuthGuard)
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post('orders/:orderId/exchange/quote')
  createQuote(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.exchangeService.createQuote(user.userId, orderId);
  }

  @Post('orders/:orderId/exchange/confirm')
  confirmQuote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: ExchangeConfirmDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.exchangeService.confirmQuote(user.userId, orderId, body.quoteId, idempotencyKey);
  }

  @Get('exchange-operations/:operationId')
  getOperation(@CurrentUser() user: AuthenticatedUser, @Param('operationId') operationId: string) {
    return this.exchangeService.getOperationView(operationId, user.userId);
  }
}
