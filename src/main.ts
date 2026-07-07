import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { corsConfig } from '@config/cors.config';
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  const port = process.env.PORT || 7070;
  await app.listen(port, '0.0.0.0');

  console.log(`NudLive API running on http://localhost:${port}`);
}
bootstrap();