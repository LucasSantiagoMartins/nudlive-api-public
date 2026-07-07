import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../../user/services/user.service';
import { HashPasswordUtils } from '@shared/utils/hash-password.utils';
import { LoginDto } from '../dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthValidator } from '../validators/auth.validator';
import { EmailUtils } from '@modules/user/utils/email.utils';
import { User } from '@modules/user/entities/user.entity';
import { UserQueryService } from '@modules/user/services/user-query.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserQueryService))
        private readonly userQueryService: UserQueryService,
         @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private jwtService: JwtService,
        private readonly validator: AuthValidator,
    ) { }

    async login(data: LoginDto): Promise<AuthResponseDto> {
        this.validator.validateLogin(data);

        const identifier = data.identifier.trim();
        const GENERIC_ERROR = 'E-mail, telefone ou senha incorretos';

        try {
            let user: User | null = null;
            let identifierType: 'email' | 'phone';

            if (EmailUtils.isEmailFormat(identifier)) {
                identifierType = 'email';
                user = await this.userQueryService.findByEmail(identifier);
            } else {
                identifierType = 'phone';
                user = await this.userQueryService.findByPhone(identifier);
            }

            if (!user) {
                console.log({
                    msg: 'Login failed - user not found',
                    action: 'AUTH_LOGIN_FAILED',
                    service: 'Auth',
                    data: {
                        identifierType,
                        identifier,
                    },
                });

                throw new UnauthorizedException(GENERIC_ERROR);
            }

            if (!user.password || typeof user.password !== 'string') {
                console.log({
                    msg: 'Login failed - account without password',
                    action: 'AUTH_LOGIN_FAILED',
                    service: 'Auth',
                    userId: user.id,
                });

                throw new UnauthorizedException(GENERIC_ERROR);
            }

            const isValid = await HashPasswordUtils.compare(
                data.password,
                user.password,
            );

            if (!isValid) {
                console.log({
                    msg: 'Login failed - invalid password',
                    action: 'AUTH_LOGIN_FAILED',
                    service: 'Auth',
                    userId: user.id,
                });

                throw new UnauthorizedException(GENERIC_ERROR);
            }

            console.log({
                msg: 'User logged in successfully',
                action: 'AUTH_LOGIN_SUCCESS',
                service: 'Auth',
                userId: user.id,
            });

            const token = this.jwtService.sign(
                {
                    sub: user.id,
                    role: user.role,
                },
                {
                    expiresIn: '7d',
                },
            );

            return { token };
        } catch (err: any) {
            console.log({
                msg: 'Unexpected error during login',
                action: 'AUTH_LOGIN_ERROR',
                service: 'Auth',
                error: err?.message || err,
                data: {
                    identifier,
                },
            });

            throw err;
        }
    }

    async validateGoogleUser(profile: any): Promise<User> {
        const email = profile.emails?.[0]?.value;

        if (!email) {
            throw new UnauthorizedException('Email não fornecido pelo Google');
        }

        let user = await this.userQueryService.findByEmail(email);

        if (user) {
            return user;
        }

        return await this.userService.createFromGoogle(profile);
    }


    async loginWithGoogle(user: User): Promise<AuthResponseDto> {
        const token = this.jwtService.sign(
            {
                sub: user.id,
                role: user.role,
            },
            { expiresIn: '7d' },
        );
        return { token }
    }
}