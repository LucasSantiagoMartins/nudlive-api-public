import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { ProfileModule } from 'apps/core-service/src/modules/profile/profile.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post, Comment]),
        ProfileModule,
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}