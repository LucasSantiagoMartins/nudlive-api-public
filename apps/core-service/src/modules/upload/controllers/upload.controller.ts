import { Controller, Post, Body } from '@nestjs/common';
import { UploadService } from '../services/upload.service';
import { CreatePresignedUploadDto } from '../dtos/create-presigned-url.dto';
import { Throttle } from '@nestjs/throttler';
import { UserDecorator } from '@nudlive/auth/decorators/user.decorator';
import { Public } from '@nudlive/auth';

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