import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { AuthGuard } from "../auth.guard"


@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard)
  @Get()
  getVideos(){
    return this.videoService.getVideos()
  }

  @Get('/random')
  getRandomBannerVideo(){
    return this.videoService.getRandomVideo();
  }

  // @UseGuards(AuthGuard)
  @Get('stream/:id')
  getVideo(@Param('id') id: string){
    return this.videoService.getVideo(id)
  }

  @UseGuards(AuthGuard)
  @Get('data/:id')
  getVideoData(@Param('id') id:string){
    return this.videoService.getVideoData(id);
  }

  @UseGuards(AuthGuard)
  @Get('episode/:id')
  getEpisodeUrl(@Param('id') id: string) {
    return this.videoService.getEpisodeUrl(id);
  }
}
