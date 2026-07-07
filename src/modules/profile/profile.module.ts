import { Module } from '@nestjs/common';
import { ProfileQueryService } from './services/profile-query.service';
import { ProfileService } from './services/profile.service';
import { ProfileController } from './controllers/profile.controller';
import { Profile } from './entities/profile.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile]),
    ],
    controllers: [ProfileController],
    providers: [ProfileService, ProfileQueryService],
    exports: [ProfileService, ProfileModule]
})
export class ProfileModule { }