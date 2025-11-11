import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VideoModule } from './modules/video/video.module';
import { PartyModule } from './gateways/party.module';

@Module({
  imports: [VideoModule ,AuthModule, UserModule, PrismaModule, PartyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
