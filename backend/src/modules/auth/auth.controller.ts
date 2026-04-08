import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { SessionAuthGuard } from '../../common/auth/session-auth.guard';
import { AuthenticatedUser } from '../../common/auth/authenticated-user.interface';
import { AuthService } from './auth.service';

class LoginStartDto {
  @IsEmail()
  email!: string;
}

class LoginVerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  loginSessionId!: string;

  @IsString()
  @Length(6, 6)
  otpCode!: string;
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('auth/health')
  getHealth() {
    return { module: 'auth', status: 'ready' };
  }

  @Post('auth/login/start')
  @HttpCode(200)
  startLogin(@Body() body: LoginStartDto) {
    return this.authService.startLogin(body.email);
  }

  @Post('auth/login/verify')
  @HttpCode(200)
  verifyLogin(@Body() body: LoginVerifyDto) {
    return this.authService.verifyLogin(body.email, body.loginSessionId, body.otpCode);
  }

  @Post('auth/logout')
  @UseGuards(SessionAuthGuard)
  @HttpCode(200)
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: { headers: Record<string, string | string[] | undefined> },
  ) {
    const authorizationHeader = request.headers.authorization;
    const bearerToken =
      typeof authorizationHeader === 'string' && authorizationHeader.startsWith('Bearer ')
        ? authorizationHeader.slice('Bearer '.length).trim()
        : user.accessToken;

    return this.authService.logout(bearerToken);
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }
}
