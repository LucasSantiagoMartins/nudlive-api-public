export class PostResponseDto {
    id: number;
    url: string;
    type: 'image' | 'video';
    caption: string;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
    creatorUsername: string;

    static fromEntity(post: any): PostResponseDto {
        const dto = new PostResponseDto();
        dto.id = post.id;
        dto.url = post.url;
        dto.type = post.type;
        dto.caption = post.caption;
        dto.likesCount = post.likesCount ?? 0;
        dto.commentsCount = post.commentsCount ?? 0;
        dto.createdAt = post.createdAt;
        dto.creatorUsername = post.profile?.user?.username || '';
        return dto;
    }
}