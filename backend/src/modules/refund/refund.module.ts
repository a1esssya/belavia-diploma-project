import { Module } from '@nestjs/common';

import { HistoryModule } from '../history/history.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { OrdersModule } from '../orders/orders.module';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';

@Module({
  imports: [OrdersModule, HistoryModule, IntegrationsModule],
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}
