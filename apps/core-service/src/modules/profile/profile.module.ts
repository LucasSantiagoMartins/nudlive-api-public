import { Module } from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'apps/core-service/src/modules/profile/entities/profile.entity';
import { ProfileQueryService } from './services/profile-query.service';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile]),
        UploadModule
    ],
    controllers: [ProfileController],
    providers: [ProfileService, ProfileQueryService],
    exports: [ProfileService, ProfileModule, ProfileQueryService]
})
export class ProfileModule { }