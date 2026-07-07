import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthValidator } from './validators/auth.validator';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ session: false }),

    forwardRef(() => UserModule),
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    AuthValidator,
    GoogleStrategy,
  ],

  exports: [AuthService],
})
export class AuthModule { }