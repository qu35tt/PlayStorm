import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UseGuards, Logger } from '@nestjs/common';
import { LoginDto, LogoutDto, RegisterDto } from './dto';
import { PrismaService } from "src/prisma/prisma.service";
const argon = require('argon2');
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(private prisma: PrismaService, private jwt: JwtService) {}

    async register(dto: RegisterDto){
        this.logger.log(`Registering user: ${dto.username}`);
        try{
            const hash = await argon.hash(dto.password)

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    password: hash
                }
            })

            const payload = { sub: user.id, username: user.username };

            const access_token = await this.jwt.signAsync(payload, { expiresIn: "30d" });

            const id = user.id

            return { id, access_token };
        }
        catch(err){
            this.logger.error(`Registration failed for ${dto.username}: ${err.message}`);
            throw new InternalServerErrorException(err)
        }
    }

    async login(dto: LoginDto){
        this.logger.log(`Login attempt for email: ${dto.email}`);
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email
                }
            })

            if(!user) {
                this.logger.warn(`User not found: ${dto.email}`);
                throw new NotFoundException("User not found")
            }

            if(!await argon.verify(user?.password, dto.password)) { 
                this.logger.warn(`Invalid credentials for: ${dto.email}`);
                throw new UnauthorizedException("Invalid credentials") 
            }

            const payload = { sub: user.id, username: user.username };

            const access_token = await this.jwt.signAsync(payload);

            const id = user.id

            return { id, access_token };
        }
        catch(err){
            if (!(err instanceof NotFoundException || err instanceof UnauthorizedException)) {
                this.logger.error(`Login error for ${dto.email}: ${err.message}`);
            }
            throw err;
        }
    }
}
