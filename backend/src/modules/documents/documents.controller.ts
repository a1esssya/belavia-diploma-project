import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { DocumentsService } from './documents.service';

@Controller('orders/:orderId/documents')
@UseGuards(SessionAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.documentsService.listForUserOrder(user.userId, orderId);
  }

  @Post('resend')
  resend(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.documentsService.resendForUserOrder(user.userId, orderId);
  }
}
