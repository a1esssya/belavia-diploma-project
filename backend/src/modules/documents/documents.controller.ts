import { Controller, Get } from '@nestjs/common';

@Controller('documents')
export class DocumentsController {
  @Get('health')
  getHealth() {
    return { module: 'documents', status: 'scaffolded' };
  }
}
