import { Module } from '@nestjs/common';

import { HistoryModule } from '../history/history.module';
import { OrdersModule } from '../orders/orders.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [OrdersModule, HistoryModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
