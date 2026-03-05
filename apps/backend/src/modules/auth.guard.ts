import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwt: JwtService,
        private prisma: PrismaService,
        private config: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        
        let payload;
        try {
            payload = await this.jwt.verifyAsync(
            token,
            {
                secret: this.config.getOrThrow('JWT_SECRET')
            }
            );
        } catch {
            throw new UnauthorizedException();
        }
        
        if (payload.sub && payload.version !== undefined) {
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: { tokenVersion: true }
            });

            if (!user || user.tokenVersion !== payload.version) {
                throw new UnauthorizedException("Session invalidated (logged in on another device)");
            }
        }

        request['user'] = payload;
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
  }
}