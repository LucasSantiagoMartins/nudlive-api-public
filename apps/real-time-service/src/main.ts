import { NestFactory } from '@nestjs/core';
import { RealTimeModule } from '../real-time.module';
import { corsConfig } from '@nudlive/common/config/cors.config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions: ServerOptions = {
      ...options,
      cors: corsConfig,
    };
    return super.createIOServer(port, serverOptions);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(RealTimeModule);
  app.enableCors(corsConfig);
  
  app.useWebSocketAdapter(new CorsIoAdapter(app));

  const port = process.env.REAL_TIME_SERVICE_PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();