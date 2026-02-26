import { Module } from '@nestjs/common';
import { EventsGateway } from './party.gateway';
import { RoomManagementService } from './room-management.service';

@Module({
    providers: [EventsGateway, RoomManagementService],
    imports: []
})
export class PartyModule {}
