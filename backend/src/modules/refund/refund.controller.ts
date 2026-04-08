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
import { RefundService } from './refund.service';

class RefundConfirmDto {
  @IsString()
  quoteId!: string;
}

@Controller()
@UseGuards(SessionAuthGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post('orders/:orderId/refund/quote')
  createQuote(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.refundService.createQuote(user.userId, orderId);
  }

  @Post('orders/:orderId/refund/confirm')
  confirmQuote(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: RefundConfirmDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.refundService.confirmQuote(user.userId, orderId, body.quoteId, idempotencyKey);
  }

  @Get('refund-operations/:operationId')
  getOperation(@CurrentUser() user: AuthenticatedUser, @Param('operationId') operationId: string) {
    return this.refundService.getOperationView(operationId, user.userId);
  }
}
