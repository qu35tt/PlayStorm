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
  @Get('stream/:id/:filename')
  getVideo(@Param('id') id: string, @Param('filename') filename: string){
    return this.videoService.streamVideo(id, filename);
  }

  @UseGuards(AuthGuard)
  @Get('data/:id')
  getVideoData(@Param('id') id:string){
    return this.videoService.getVideoData(id);
  }

  @Get('genres/all')
  getAllGenres() {
    return this.videoService.getAllGenres();
  }
}