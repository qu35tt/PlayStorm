import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { AuthGuard } from "../auth.guard"
import { SaveProgressDto } from './dto/save-progress.dto';


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
  getVideoData(@Req() req: any, @Param('id') id:string){
    return this.videoService.getVideoData(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('progress/:id')
  getVideoProgress(@Req() req: any, @Param('id') id: string) {
    return this.videoService.getVideoProgress(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Post('progress')
  saveProgress(@Req() req: any, @Body() dto: SaveProgressDto) {
    return this.videoService.saveProgress(req.user.sub, dto);
  }

  @Get('genres/all')
  getAllGenres() {
    return this.videoService.getAllGenres();
  }

  @UseGuards(AuthGuard)
  @Get('recommendations')
  getRecommendations(@Req() req: any) {
    return this.videoService.getRecommendations(req.user.sub);
  }
  }