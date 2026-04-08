import { Controller, Get } from '@nestjs/common';

@Controller('history')
export class HistoryController {
  @Get('health')
  getHealth() {
    return { module: 'history', status: 'scaffolded' };
  }
}
