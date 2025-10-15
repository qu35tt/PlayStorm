import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from '../proxy/proxy/proxy.module';

@Module({
  imports: [HttpModule, ProxyModule], 
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
