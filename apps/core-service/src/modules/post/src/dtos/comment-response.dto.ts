import { Comment } from "../entities/comment.entity";

export class CommentResponseDto {
    id: number;
    content: string;
    createdAt: Date;
    username: string;
    profilePhotoUrl: string;

    static fromEntity(comment: Comment): CommentResponseDto {
        const dto = new CommentResponseDto();
        dto.id = comment.id;
        dto.content = comment.content;
        dto.createdAt = comment.createdAt;
        dto.username = comment.profile?.user?.username || '';
        dto.profilePhotoUrl = comment.profile?.profilePhotoUrl || '';
        return dto;
    }
}