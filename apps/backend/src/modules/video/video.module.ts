import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule], 
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
