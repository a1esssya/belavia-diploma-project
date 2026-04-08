import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../common/database.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BookingLookupModule } from './booking-lookup/booking-lookup.module';
import { DocumentsModule } from './documents/documents.module';
import { ExchangeModule } from './exchange/exchange.module';
import { HistoryModule } from './history/history.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { OrdersModule } from './orders/orders.module';
import { RefundModule } from './refund/refund.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    OrdersModule,
    DocumentsModule,
    HistoryModule,
    ExchangeModule,
    RefundModule,
    BookingLookupModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
