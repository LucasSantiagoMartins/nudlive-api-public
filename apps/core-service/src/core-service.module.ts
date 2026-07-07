import { Module } from '@nestjs/common';
import { CommonModule } from '@nudlive/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { JwtAuthModule } from '@nudlive/auth';
import { UploadModule } from './modules/upload/upload.module';
import { PostModule } from './modules/post/src/post.module';

@Module({
  imports: [
    CommonModule.register(),

    AuthModule,
    UserModule,
    ProfileModule,
    UploadModule,
    PostModule,

    JwtAuthModule,
  ],
})
export class CoreServiceModule { }