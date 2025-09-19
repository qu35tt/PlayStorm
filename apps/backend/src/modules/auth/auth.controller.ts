import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RegisterDto } from './dto';
import { AuthGuard } from "../auth.guard"

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto){
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto){
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Body() dto: LogoutDto){
    return this.authService.logout(dto);
  }
}