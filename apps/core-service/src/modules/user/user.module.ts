import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { ProfileModule } from '../profile/profile.module';
import { UserQueryService } from 'apps/core-service/src/modules/user/services/user-query.service';
import { KafkaModule } from '@nudlive/kafka';
import { User } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        ProfileModule,
        KafkaModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserQueryService],
    exports: [UserService, UserQueryService],
})
export class UserModule { }