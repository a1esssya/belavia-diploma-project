import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('health')
  getHealth() {
    return { module: 'auth', status: 'scaffolded' };
  }
}
