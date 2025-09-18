import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
require("dotenv")


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwt: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean>  {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
        throw new UnauthorizedException();
        }
        try {
        const payload = await this.jwt.verifyAsync(
            token,
            {
            secret: process.env.JWT_SECRET
            }
        );
        request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
  }
}