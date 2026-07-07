import { NestFactory } from '@nestjs/core';
import { CoreServiceModule } from './core-service.module';
import { corsConfig } from '@nudlive/common/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(CoreServiceModule);
  app.enableCors(corsConfig);
  const port = process.env.CORE_SERVICE_PORT || 3000
  await app.listen(port ?? '0.0.0.0');
}
bootstrap();
