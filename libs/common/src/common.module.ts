import { DynamicModule, Module, ValidationPipe } from '@nestjs/common';
import {
  APP_FILTER,
  APP_INTERCEPTOR,
  APP_PIPE,
} from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ResponseInterceptor } from './interceptors/response.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

@Module({})
export class CommonModule {
  static register(prefix?: string): DynamicModule {
    const pfx = prefix ? `${prefix.toUpperCase()}_` : '';

    return {
      module: CommonModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
            }),
          ],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host:
              config.get(`${pfx}DB_HOST`) ??
              config.get('DB_HOST'),
            port: Number(
              config.get(`${pfx}DB_PORT`) ??
                config.get('DB_PORT') ??
                5432,
            ),
            username:
              config.get(`${pfx}DB_USER`) ??
              config.get('DB_USER'),
            password:
              config.get(`${pfx}DB_PASS`) ??
              config.get('DB_PASS'),
            database:
              config.get(`${pfx}DB_NAME`) ??
              config.get('DB_NAME'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
      ],

      providers: [
        {
          provide: APP_PIPE,
          useFactory: () =>
            new ValidationPipe({
              whitelist: true,
              transform: true,
              stopAtFirstError: true,
            }),
        },
        {
          provide: APP_FILTER,
          useClass: GlobalExceptionFilter,
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: ResponseInterceptor,
        },
      ],

      exports: [TypeOrmModule],
    };
  }
}