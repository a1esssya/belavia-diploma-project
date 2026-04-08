import { Controller, Get } from '@nestjs/common';

@Controller('refund')
export class RefundController {
  @Get('health')
  getHealth() {
    return { module: 'refund', status: 'scaffolded' };
  }
}
