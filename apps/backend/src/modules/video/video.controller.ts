import { Controller, Get, Param } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get()
  getVideos(){
    return this.videoService.getVideos()
  }

  @Get(':id')
  getVideo(@Param('id') id: string){
    return this.videoService.getVideo(id)
  }
}
