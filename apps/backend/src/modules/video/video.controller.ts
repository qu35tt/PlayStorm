import { Body, Controller, Get, Param, Post, Req, UseGuards, Logger } from '@nestjs/common';
import { VideoService } from './video.service';
import { AuthGuard } from "../auth.guard"
import { SaveProgressDto } from './dto/save-progress.dto';


@Controller('video')
export class VideoController {
  private readonly logger = new Logger(VideoController.name);
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard)
  @Get()
  getVideos(){
    this.logger.log('GET /video - Fetching all videos');
    return this.videoService.getVideos()
  }

  @Get('/random')
  getRandomBannerVideo(){
    this.logger.log('GET /video/random - Fetching random banner video');
    return this.videoService.getRandomVideo();
  }

  // @UseGuards(AuthGuard)
  @Get('stream/:id/:filename')
  getVideo(@Param('id') id: string, @Param('filename') filename: string){
    this.logger.log(`GET /video/stream/${id}/${filename} - Streaming content`);
    return this.videoService.streamVideo(id, filename);
  }

  @UseGuards(AuthGuard)
  @Get('data/:id')
  getVideoData(@Req() req: any, @Param('id') id:string){
    this.logger.log(`GET /video/data/${id} - Fetching video data for user: ${req.user.sub}`);
    return this.videoService.getVideoData(id, req.user.sub);
  }

  @UseGuards(AuthGuard)
  @Get('progress/:id')
  getVideoProgress(@Req() req: any, @Param('id') id: string) {
    this.logger.log(`GET /video/progress/${id} - Fetching progress for user: ${req.user.sub}`);
    return this.videoService.getVideoProgress(req.user.sub, id);
  }

  @UseGuards(AuthGuard)
  @Post('progress')
  saveProgress(@Req() req: any, @Body() dto: SaveProgressDto) {
    this.logger.log(`POST /video/progress - Saving progress for user: ${req.user.sub}`);
    return this.videoService.saveProgress(req.user.sub, dto);
  }

  @Get('genres/all')
  getAllGenres() {
    this.logger.log('GET /video/genres/all - Fetching all genres');
    return this.videoService.getAllGenres();
  }

  @UseGuards(AuthGuard)
  @Get('recommendations')
  getRecommendations(@Req() req: any) {
    this.logger.log(`GET /video/recommendations - Fetching recommendations for user: ${req.user.sub}`);
    return this.videoService.getRecommendations(req.user.sub);
  }
  }