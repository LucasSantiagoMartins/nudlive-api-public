import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { User } from './entities/user.entity';
import { UserQueryService } from './services/user-query.service';
import { ProfileModule } from '@modules/profile/profile.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        ProfileModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserQueryService],
    exports: [UserService, UserQueryService],
})
export class UserModule { }