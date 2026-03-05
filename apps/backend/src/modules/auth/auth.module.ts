import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'), // Ensure this is in your env.validation.ts
        signOptions: { expiresIn: '1h' },
      }),
    })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
