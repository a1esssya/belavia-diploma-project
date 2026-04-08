import { Controller, Get } from '@nestjs/common';

@Controller('integrations')
export class IntegrationsController {
  @Get('health')
  getHealth() {
    return { module: 'integrations', status: 'scaffolded' };
  }
}
