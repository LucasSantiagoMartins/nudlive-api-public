import { Controller, Post, Body, Patch, Get, Param } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dtos/profile.dto';
import { ProfileResponseDto } from '../dtos/profile-response.dto';
import { ProfileQueryService } from '../services/profile-query.service';
import { UserDecorator } from '@nudlive/auth/decorators/user.decorator';
import { SuccessMessage } from '@nudlive/common/decorators/success-message.decorator';
import { Roles } from '@nudlive/auth/decorators/roles.decorator';

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService,
        private readonly profileQueryService: ProfileQueryService
    ) { }

    @Get('me')
    async getMe(@UserDecorator('sub') userId: number) {
        return await this.profileQueryService.getMe(userId);
    }

    @Post(':username/follow')
    async toggleFollow(
        @UserDecorator('sub') userId: number,
        @Param('username') username: string
    ) {
        return await this.profileService.toggleFollow(userId, username);
    }

    @Patch('me')
    @SuccessMessage('Perfil atualizado com sucesso')
    async update(
        @UserDecorator('sub') userId: number,
        @Body() body: UpdateProfileDto
    ) {
        return await this.profileService.updateProfile(userId, body);
    }
}