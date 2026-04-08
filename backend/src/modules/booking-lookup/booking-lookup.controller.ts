import { Controller, Get } from '@nestjs/common';

@Controller('booking')
export class BookingLookupController {
  @Get('health')
  getHealth() {
    return { module: 'booking-lookup', status: 'scaffolded' };
  }
}
