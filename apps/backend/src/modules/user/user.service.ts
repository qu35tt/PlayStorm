import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDataDto } from './dto';
const argon = require('argon2');

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUser(id: string) {
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    id
                },
                select: {
                    username: true,
                    email: true
                }
            })

            if(!user) throw new NotFoundException("User with this id does not exist")

            return user;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async updateUser(dto: UserDataDto, id: string){
        try{
            let hash: string | undefined;
            if(dto.password){ 
                hash = await argon.hash(dto.password); 
            }
                
            const updateUser = await this.prisma.user.update({
                where: {
                    id
                },
                data: {
                    username: dto.username,
                    email: dto.email,
                    password: hash 
                }
            })

            return updateUser;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }
}
