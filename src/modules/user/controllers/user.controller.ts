import { Controller, Get, Post, Body, Query, Delete, Param, Patch, Res } from '@nestjs/common';
import { UserDecorator } from '@modules/auth-guard/decorators/user.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { SuccessMessage } from '@shared/decorators/success-message.decorator';
import { UserService } from '../services/user.service';
import { ChangePasswordDto, CreatorProfileDto, } from '@modules/user/dtos/user.dtos';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@modules/auth-guard/decorators/public.decorator';
import { UserQueryService } from '../services/user-query.service';
import { getAuthCookieOptions } from '@modules/auth/utils/auth-cookie.util';
import { Response } from 'express';
import { RegisterUserDto } from '../dtos/register-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userQueryService: UserQueryService,
  ) { }

  @Post()
  @Public()
  @SuccessMessage('Conta criada com sucesso')
  async register(
    @Body() body: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response =
      await this.userService.register(body);

    res.cookie(
      'access_token',
      response.token,
      {
        ...getAuthCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return null;
  }

  @Patch('become-creator')
  @SuccessMessage('Perfil atualizado para criador com sucesso')
  async becomeCreator(
    @UserDecorator('sub') userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    return true
    const response = await this.userService.convertToCreator(userId);

    res.cookie(
      'access_token',
      response.token,
      {
        ...getAuthCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );

    return null;
  }

  @Get('creator/:username')
  @Public()
  async getCreatorProfile(
    @Param('username') username: string,
    @UserDecorator('sub') userId: number,
  ) {
    return await this.userQueryService.getCreatorByUsername(username, userId);
  }

  @Post('change-password')
  @Throttle({ short: {} })
  @SuccessMessage('Senha alterada com sucesso')
  async changePassword(
    @UserDecorator('sub') userId: number,
    @Body() body: ChangePasswordDto
  ) {
    return await this.userService.changePassword(userId, body);
  }

  @Get('check-username')
  @Public()
  async checkUsername(@Query('username') username: string) {
    return await this.userService.checkUsernameExists(username);
  }

}