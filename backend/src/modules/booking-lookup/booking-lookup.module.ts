import { Module } from '@nestjs/common';

import { OrdersModule } from '../orders/orders.module';
import { BookingLookupController } from './booking-lookup.controller';
import { BookingLookupService } from './booking-lookup.service';

@Module({
  imports: [OrdersModule],
  controllers: [BookingLookupController],
  providers: [BookingLookupService],
})
export class BookingLookupModule {}
