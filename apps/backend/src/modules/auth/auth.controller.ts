import { Body, Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RegisterDto } from './dto';
import { AuthGuard } from "../auth.guard"

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto){
    this.logger.log(`POST /auth/register - Registering user: ${dto.username}`);
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto){
    this.logger.log(`POST /auth/login - Login attempt for: ${dto.email}`);
    return this.authService.login(dto);
  }
}