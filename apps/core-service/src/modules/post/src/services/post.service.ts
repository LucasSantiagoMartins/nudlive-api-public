import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { ProfileQueryService } from 'apps/core-service/src/modules/profile/services/profile-query.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { PostResponseDto } from '../dtos/post-response.dtot';
import { CommentResponseDto } from '../dtos/comment-response.dto';
import { CreateCommentDto } from '../dtos/post.dtos';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly profileQueryService: ProfileQueryService,
    private readonly dataSource: DataSource,
  ) { }

  async create(userId: number, data: CreatePostDto): Promise<PostResponseDto> {

    const profile = await this.profileQueryService.getByUserId(userId);

    const post = this.postRepository.create({
      url: data.url,
      type: data.type,
      caption: data.caption,
      profile,
    });

    const savedPost = await this.postRepository.save(post);
    return PostResponseDto.fromEntity(savedPost);
  }

  async findByCreatorUsername(username: string, page: number = 1): Promise<PostResponseDto[]> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const posts = await this.postRepository.find({
      where: { profile: { user: { username } } },
      relations: ['profile', 'profile.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return posts.map(post => PostResponseDto.fromEntity(post));
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['profile', 'profile.user'],
    });

    if (!post) {
      throw new NotFoundException('Publicação não encontrada.');
    }

    return PostResponseDto.fromEntity(post);
  }

  async toggleLike(userId: number, postId: number): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicação não encontrada.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hasLiked = false;

      if (hasLiked) {
        post.likesCount = Math.max(0, post.likesCount - 1);
      } else {
        post.likesCount += 1;
      }

      await queryRunner.manager.save(Post, post);
      await queryRunner.commitTransaction();

      return {
        liked: !hasLiked,
        likesCount: post.likesCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(userId: number, id: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!post) {
      throw new NotFoundException('Publicação não encontrada.');
    }

    if (post.profile.id !== (await this.profileQueryService.getByUserId(userId)).id) {
      throw new ForbiddenException('Você não tem permissão para remover esta publicação.');
    }

    await this.postRepository.remove(post);
  }


  async addComment(userId: number, postId: number, data: CreateCommentDto): Promise<CommentResponseDto> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicação não encontrada');
    }

    const profile = await this.profileQueryService.getByUserId(userId);
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = queryRunner.manager.create(Comment, {
        content: data.content,
        post,
        profile,
      });

      const savedComment = await queryRunner.manager.save(Comment, comment);

      post.commentsCount += 1;
      await queryRunner.manager.save(Post, post);

      await queryRunner.commitTransaction();

      savedComment.profile = profile;
      return CommentResponseDto.fromEntity(savedComment);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }



  async getComments(postId: number, page: number = 1): Promise<CommentResponseDto[]> {
    const limit = 10;
    const skip = (page - 1) * limit;

    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['profile', 'profile.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return comments.map(comment => CommentResponseDto.fromEntity(comment));
  }
}