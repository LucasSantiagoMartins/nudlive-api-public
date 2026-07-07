import { Controller, Post, Body, Get, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { UserDecorator } from '@nudlive/auth/decorators/user.decorator';
import { Roles } from '@nudlive/auth/decorators/roles.decorator';
import { UserRole } from '@nudlive/common/enums/user-role.enum';
import { CreatePostDto } from '../dtos/create-post.dto';
import { PostResponseDto } from '../dtos/post-response.dtot';
import { CreateCommentDto } from '../dtos/post.dtos';
import { CommentResponseDto } from '../dtos/comment-response.dto';

@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    @Roles(UserRole.CREATOR)
    async create(
        @UserDecorator('sub') userId: number,
        @Body() body: CreatePostDto,
    ): Promise<PostResponseDto> {
        return await this.postService.create(userId, body);
    }

    @Get('creator/:username')
    async getByCreator(
        @Param('username') username: string,
        @Query('page') page: number = 1,
    ): Promise<PostResponseDto[]> {
        return await this.postService.findByCreatorUsername(username, page);
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<PostResponseDto> {
        return await this.postService.findOne(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @UserDecorator('sub') userId: number,
        @Param('id') id: number,
    ): Promise<void> {
        await this.postService.remove(userId, id);
    }

    @Post(':id/like')
    async toggleLike(
        @UserDecorator('sub') userId: number,
        @Param('id') id: number,
    ): Promise<{ liked: boolean; likesCount: number }> {
        return await this.postService.toggleLike(userId, id);
    }

    @Post(':id/comments')
    async addComment(
        @UserDecorator('sub') userId: number,
        @Param('id') id: number,
        @Body() body: CreateCommentDto,
    ): Promise<CommentResponseDto> {
        return await this.postService.addComment(userId, id, body);
    }

    @Get(':id/comments')
    async getComments(
        @Param('id') id: number,
        @Query('page') page: number = 1,
    ): Promise<CommentResponseDto[]> {
        return await this.postService.getComments(id, page);
    }
}