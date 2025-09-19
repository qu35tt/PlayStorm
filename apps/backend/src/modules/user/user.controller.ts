import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDataDto } from './dto';
import { AuthGuard } from "../auth.guard"

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('me/:id')
  getUser(@Param('id') id: string){
    return this.userService.getUser(id);
  }

  @UseGuards(AuthGuard)
  @Put('update/:id')
  updateUser(@Body() dto: UserDataDto, @Param('id') id: string){
    return this.userService.updateUser(dto, id);
  }
}
