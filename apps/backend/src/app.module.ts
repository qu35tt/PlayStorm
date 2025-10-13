import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { EventsGateway } from './gateways/party.gateway';
import { VideoModule } from './modules/video/video.module';

@Module({
  imports: [VideoModule ,AuthModule, UserModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
