import { Controller, Get } from '@nestjs/common';

@Controller('exchange')
export class ExchangeController {
  @Get('health')
  getHealth() {
    return { module: 'exchange', status: 'scaffolded' };
  }
}
