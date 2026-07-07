import { Controller, Get, Post, Body, Query, Delete, Param, Patch, Res } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Response } from 'express';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserQueryService } from 'apps/core-service/src/modules/user/services/user-query.service';
import { Public } from '@nudlive/auth';
import { SuccessMessage } from '@nudlive/common/decorators/success-message.decorator';
import { getAuthCookieOptions } from '../../auth/utils/auth-cookie.util';
import { UserDecorator } from '@nudlive/auth/decorators/user.decorator';
import { ChangePasswordDto } from '../dtos/change-password.dto';

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
  // @Throttle({ short: {} })
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