import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { LiveService } from '../services/live.service';
import { CreateLiveDto } from '../dtos/create-live.dto';
import { LiveQueryService } from '../services/live-query.service';
import { LiveStatus } from '../enums/live-status.enum';
import { UserDecorator, Public } from '@nudlive/auth';
import { UserRole } from '@nudlive/common/enums/user-role.enum';
import { SuccessMessage } from '@nudlive/common/decorators/success-message.decorator';
import { Roles } from '@nudlive/auth/decorators/roles.decorator';

@Controller('lives')
export class LiveController {
    constructor(
        private readonly liveService: LiveService,
        private readonly liveQueryService: LiveQueryService,
    ) { }

    @Post()
    @Roles(UserRole.CREATOR)
    @SuccessMessage('Live criada com sucesso')
    async create(@UserDecorator('sub') userId: number, @Body() body: CreateLiveDto) {
        return this.liveService.create(userId, body);
    }

    @Patch(':id/status')
    @Roles(UserRole.CREATOR)
    async updateStatus(
        @Param('id') id: string,
        @UserDecorator('sub') userId: number,
        @Body('status') status: LiveStatus,
    ) {
        return this.liveService.updateStatus(id, userId, status);
    }

    @Get('creator/:username')
    @Public()
    async getByCreatorUsername(@Param('username') username: string) {
        return this.liveQueryService.getByCreatorUsername(username);
    }

    @Get()
    @Public()
    async getActiveLives() {
        return this.liveQueryService.getActiveLives();
    }

    @Get('me')
    @Roles(UserRole.CREATOR)
    async getMyLives(@UserDecorator('sub') userId: number) {
        return this.liveQueryService.getByCreator(userId);
    }

    @Get(':id')
    @Public()
    async getById(@Param('id') id: string) {
        return this.liveQueryService.getById(id);
    }

    @Get(':id/livekit-token')
    async getLiveKitToken(
        @Param('id') id: string,
        @UserDecorator('sub') userId: number,
    ) {
        return this.liveService.getLiveKitToken(id, userId);
    }
}