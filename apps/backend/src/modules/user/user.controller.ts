import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDataDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me/:id')
  getUser(@Param('id') id: string){
    return this.userService.getUser(id);
  }

  @Put('update/:id')
  updateUser(@Body() dto: UserDataDto, @Param('id') id: string){
    return this.userService.updateUser(dto, id);
  }
}
