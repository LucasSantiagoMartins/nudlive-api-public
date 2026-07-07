import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from '../services/upload.service';
import { CreatePresignedUploadDto } from '../dtos/create-presigned-url.dto';
import { UserDecorator } from '@modules/auth-guard/decorators/user.decorator';
import { Public } from '@modules/auth-guard/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('uploads')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post('presigned')
    @Throttle({ short: {} })
    async getPresignedUrl(
        @UserDecorator('sub') userId: number,
        @Body() data: CreatePresignedUploadDto,
    ) {
        return this.uploadService.createPresignedUpload(userId, data);
    }

    @Post('presigned-public')
    @Throttle({ short: {} })
    @Public()
    async getPublicPresignedUrl(
        @Body() data: CreatePresignedUploadDto,
    ) {
        return this.uploadService.createPublicPresignedUpload(
            data,
        );
    }
}