import { NestFactory } from '@nestjs/core';
import { AppModule } from './media-live-service.module';
import { corsConfig } from '@nudlive/common/config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(corsConfig);

  const port = process.env.LIVE_SERVICE_PORT || 3000
  await app.listen(port ?? '0.0.0.0');
}
bootstrap();
