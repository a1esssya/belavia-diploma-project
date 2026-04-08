import { Module } from '@nestjs/common';

import { MockLeonardoGateway } from './gateway/mock-leonardo.gateway';
import { IntegrationsController } from './integrations.controller';

@Module({
  controllers: [IntegrationsController],
  providers: [MockLeonardoGateway],
  exports: [MockLeonardoGateway],
})
export class IntegrationsModule {}
