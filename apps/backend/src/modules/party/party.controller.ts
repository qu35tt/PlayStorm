import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { PartyService } from './party.service';
import { ControlDto, InviteDto, Message } from './dto';

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post()
  createParty(userId: string) {
    return this.partyService.createParty(userId)
  }

  @Delete('/id')
  endParty(@Param('id') id: string){
    return this.partyService.endParty(id)
  }

  @Get(':id')
  getInfo(@Param('id') id: string){
    return this.partyService.getInfo(id);
  }

  @Post('/join')
  joinParty(@Body() dto: InviteDto){
    return this.partyService.joinParty(dto)
  }

  @Get('/leave/:id')
  leaveParty(@Param('id') id: string){
    return this.partyService.leaveParty(id)
  }

  @Post('/control')
  controlParty(@Body() dto: ControlDto){
    return this.partyService.controlParty(dto)
  }

  @Get('/messages/fetch/:id')
  fetchMessages(@Param('id') id: string){
    return this.partyService.fetchMessages(id)
  }

  @Post('/messages/send')
  sendMessage(@Body() dto: Message){
    return this.partyService.sendMessage(dto)
  }
}
