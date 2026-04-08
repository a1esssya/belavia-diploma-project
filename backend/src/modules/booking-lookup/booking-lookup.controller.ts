import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

import { BookingLookupService } from './booking-lookup.service';

class BookingLookupDto {
  @IsOptional()
  @IsString()
  pnr?: string;

  @IsOptional()
  @IsString()
  ticketNumber?: string;

  @IsString()
  passengerLastName!: string;
}

@Controller('booking')
export class BookingLookupController {
  constructor(private readonly bookingLookupService: BookingLookupService) {}

  @Get('health')
  getHealth() {
    return { module: 'booking-lookup', status: 'ready' };
  }

  @Post('lookup')
  lookup(@Body() body: BookingLookupDto) {
    return this.bookingLookupService.lookup(body);
  }
}
