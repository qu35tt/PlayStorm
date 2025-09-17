import { BadRequestException, Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ControlDto, InviteDto, Message } from './dto'

@Injectable()
export class PartyService {
    constructor(private prisma: PrismaService) {}

    async createParty(userId: string){
        try{
            const party = await this.prisma.party.create({
                data: {
                    owner_id: userId
                }
            })

            //Here i emit an socket.io event.

            return "Party Created";
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async endParty(partyId: string){
        try{
            const party = await this.prisma.party.delete({
                where: {
                    id: partyId
                }
            })

            //Here i emit an socket.io event.

            return "Party Ended";
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async getInfo(id: string) {
        try{
            const party = await this.prisma.party.findUnique({
                where: {
                    id
                }
            })

            return party;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async joinParty(dto: InviteDto) {
        try{
            const partyMembers = this.prisma.partyMembers.create({
                data: {
                    user_id: dto.userId,
                    party_id: dto.partyId
                }
            })

            if(!partyMembers) {throw new ServiceUnavailableException()}

            //socket.io event emit

            return "Joined";
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async leaveParty(partyId: string) {
        try{
            const partyMember = await this.prisma.partyMembers.findFirst({
                where: {
                    party_id: partyId
                },
                select: {
                    id: true
                }
            })

            if(!partyMember) {throw new BadRequestException()}

            const leaveParty = this.prisma.partyMembers.delete({
                where: {
                    id: partyMember?.id
                }
            })

            //socket.io event emit

            return "Left";
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async controlParty(dto: ControlDto){
        try{
            //here will be socket.io events for controlling the party
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async fetchMessages(id: string){
        try{
            const messages = this.prisma.messages.findMany({
                where: {
                    party_id: id
                },

                select: {
                    text: true,
                    createdAt: true,
                    sender_id: true
                }
            })

            return messages;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async sendMessage(dto: Message){
        try{
            const message = this.prisma.messages.create({
                data: {
                    sender_id: dto.senderId,
                    text: dto.text,
                    party_id: dto.partyId,
                }
            })
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }
}
