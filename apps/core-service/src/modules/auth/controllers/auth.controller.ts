import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { Public } from '@nudlive/auth/decorators/public.decorator';
import { getAuthCookieOptions } from '../utils/auth-cookie.util';
import { SuccessMessage } from '@nudlive/common/decorators/success-message.decorator';
import { RequestWithUser } from '@nudlive/auth/interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
    ) { }

    @Post('login')
    @Public()
    // @Throttle({ short: {} })
    @SuccessMessage('Inicio de sessão feito com sucesso')
    async login(
        @Body() data: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const response = await this.authService.login(data);

        res.cookie('access_token', response.token, {
            ...getAuthCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return null;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', getAuthCookieOptions());
        return null;
    }

    @Get('google')
    @Public()
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Get('google/callback')
    @Public()
    @UseGuards(AuthGuard('google'))
    async googleCallback(
        @Req() req: RequestWithUser,
        @Res() res: Response,
    ) {
        const response = await this.authService.loginWithGoogle(req.user);

        res.cookie('access_token', response.token, {
            ...getAuthCookieOptions(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect('http://localhost:7071/');
    }

}