import { Controller, Get } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  @Get('health')
  getHealth() {
    return { module: 'orders', status: 'scaffolded' };
  }
}
