import { Body, Controller, Get, Param, Put, UseGuards, Post, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDataDto } from './dto';
import { AuthGuard } from "../auth.guard"
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Request() req){
    return this.userService.getUser(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Put('update')
  updateUser(@Body() dto: UserDataDto, @Request() req){
    return this.userService.updateUser(dto, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @Request() req){
    return this.userService.uploadAvatar(req.user.sub, file)
  }
}
