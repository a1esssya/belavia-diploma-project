import { Module } from '@nestjs/common';

import { BookingLookupController } from './booking-lookup.controller';

@Module({
  controllers: [BookingLookupController],
})
export class BookingLookupModule {}
