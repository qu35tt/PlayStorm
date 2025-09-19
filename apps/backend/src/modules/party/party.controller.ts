import { Controller, Post, Get, Param, Body, Delete, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { ControlDto, InviteDto, Message } from './dto';
import { AuthGuard } from "../auth.guard"

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @UseGuards(AuthGuard)
  @Post()
  createParty(userId: string) {
    return this.partyService.createParty(userId)
  }

  @UseGuards(AuthGuard)
  @Delete('/id')
  endParty(@Param('id') id: string){
    return this.partyService.endParty(id)
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getInfo(@Param('id') id: string){
    return this.partyService.getInfo(id);
  }

  @UseGuards(AuthGuard)
  @Post('/join')
  joinParty(@Body() dto: InviteDto){
    return this.partyService.joinParty(dto)
  }

  @UseGuards(AuthGuard)
  @Get('/leave/:id')
  leaveParty(@Param('id') id: string){
    return this.partyService.leaveParty(id)
  }

  @UseGuards(AuthGuard)
  @Post('/control')
  controlParty(@Body() dto: ControlDto){
    return this.partyService.controlParty(dto)
  }

  @UseGuards(AuthGuard)
  @Get('/messages/fetch/:id')
  fetchMessages(@Param('id') id: string){
    return this.partyService.fetchMessages(id)
  }

  @UseGuards(AuthGuard)
  @Post('/messages/send')
  sendMessage(@Body() dto: Message){
    return this.partyService.sendMessage(dto)
  }
}
