import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './party.gateway';
import { RoomManagementService } from './room-management.service';

@Global()
@Module({
    providers: [EventsGateway, RoomManagementService],
    exports: [EventsGateway],
    imports: []
})
export class PartyModule {}
