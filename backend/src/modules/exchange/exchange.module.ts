import { Module } from '@nestjs/common';

import { HistoryModule } from '../history/history.module';
import { OrdersModule } from '../orders/orders.module';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';

@Module({
  imports: [OrdersModule, HistoryModule],
  controllers: [ExchangeController],
  providers: [ExchangeService],
})
export class ExchangeModule {}
