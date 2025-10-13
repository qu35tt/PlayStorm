import { Module } from '@nestjs/common';
import { EventsGateway } from './party.gateway';

@Module({
    providers: [EventsGateway]
})
export class PartyModule {}
