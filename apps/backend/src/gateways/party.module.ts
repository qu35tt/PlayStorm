import { Module } from '@nestjs/common';
import { EventsGateway } from './party.gateway';
import { RoomManagmentService } from './room-managment.service';

@Module({
    providers: [EventsGateway, RoomManagmentService],
    imports: []
})
export class PartyModule {}
