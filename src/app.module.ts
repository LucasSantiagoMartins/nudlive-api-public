import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseInterceptor } from '@shared/interceptors/response.interceptor';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmExceptionFilter } from '@shared/filters/typeorm-exception.filter';
import { CustomThrottlerGuard } from '@shared/guards/custom-throttler.guard';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthGuardModule } from '@modules/auth-guard/auth-guard.module';
import { ProfileModule } from '@modules/profile/profile.module';
import { LiveModule } from '@modules/live/live.module';
import { PresenceModule } from '@modules/presence/presence.module';
import { ChatModule } from '@modules/chat/chat.module';
import { RedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { AppRedisModule } from '@shared/redis/redis.module';
import { UploadModule } from '@modules/upload/upload.module';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    }
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
          },
          ttl: 60,
        });

        return {
          store: () => store,
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        extra: {
          max: 10,
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default', ttl: 60000, limit: 20 },
        { name: 'short', ttl: 1000, limit: 5 },
        { name: 'medium', ttl: 60000, limit: 20 },
        { name: 'long', ttl: 60000, limit: 30 },
      ],
    }),
    AuthModule,
    AuthGuardModule,
    UserModule,
    ProfileModule,
    LiveModule,
    PresenceModule,
    ChatModule,
    AppRedisModule,
    UploadModule,
  ],
})
export class AppModule { }