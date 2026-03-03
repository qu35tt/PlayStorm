import { Body, Controller, Get, Param, Put, UseGuards, Post, UseInterceptors, UploadedFile, Request, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDataDto } from './dto';
import { AuthGuard } from "../auth.guard"
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Request() req){
    this.logger.log(`GET /user/me - Fetching profile for user: ${req.user.sub}`);
    return this.userService.getUser(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('update')
  updateUser(@Body() dto: UserDataDto, @Request() req){
    this.logger.log(`PUT /user/update - Updating profile for user: ${req.user.sub}`);
    return this.userService.updateUser(dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req){
    this.logger.log(`POST /user/upload - Uploading avatar for user: ${req.user.sub}`);
    return this.userService.uploadAvatar(req.user.sub, file)
  }
}
