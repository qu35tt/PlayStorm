import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto, LogoutDto, RegisterDto } from './dto';
import { PrismaService } from "src/prisma/prisma.service";
const argon = require('argon2');

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async register(dto: RegisterDto){
        try{
            const hash = await argon.hash(dto.password)

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    password: hash
                }
            })

            return user;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async login(dto: LoginDto){
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            })

            if(!user) {throw new NotFoundException("User not found")}

            if(!await argon.verify(user?.password, dto.password)) { throw new UnauthorizedException("Invalid credentials") }

            return user;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async logout(dto: LogoutDto){
        try{
            return "Logged out succesfully!"
        }
        catch(err) {
            throw new InternalServerErrorException()
        }
    }
}
