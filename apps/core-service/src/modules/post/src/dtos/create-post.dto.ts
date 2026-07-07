export class CreatePostDto {
    url: string;
    type: 'image' | 'video';
    caption?: string;
}