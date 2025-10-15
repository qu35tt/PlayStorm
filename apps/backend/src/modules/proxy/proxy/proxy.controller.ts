import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { spawn } from 'child_process';
import { ProxyService } from './proxy.service';
// using Nest's built-in Logger instead of a custom getLogger

@Controller('api')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  constructor(private readonly proxy: ProxyService) {}

  private validateUrl(url?: string) {
    if (!url) {
      this.logger.error('URL parameter is required');
      throw new BadRequestException('URL parameter is required');
    }
    return url;
  }

  @Get('vtt')
  async getVtt(@Query('url') url: string, @Res() res: Response) {
    const reqUrl = this.validateUrl(url);
    try {
      const { stream, headers, status } = await this.proxy.fetchStream(reqUrl);
      // forward upstream headers
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.status(status);
      stream.pipe(res);
    } catch (err: any) {
      this.logger.error(`Error fetching vtt: ${err.message}`);
      throw new InternalServerErrorException('Error occurred while fetching text/vtt data');
    }
  }

  @Get('m3u8')
  async getM3u8(@Query('url') url: string, @Req() req: Request, @Res() res: Response) {
    const reqUrl = this.validateUrl(url);
    try {
      // fetch playlist text
      const playlist = await this.proxy.fetchText(reqUrl);

      // rewrite segment URIs to point to our transcode endpoint
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const outLines = playlist.split(/\r?\n/).map((line) => {
        // keep comments/directives as-is
        if (!line || line.startsWith('#')) return line;

        // resolve relative URLs against playlist URL
        try {
          const abs = new URL(line, reqUrl).href;
          const proxied = `${baseUrl}/api/transcode?url=${encodeURIComponent(abs)}`;
          return proxied;
        } catch (e) {
          return line;
        }
      });

      const rewritten = outLines.join('\n');
      res.setHeader('Content-Type', 'application/x-mpegURL');
      return res.send(rewritten);
    } catch (err: any) {
      this.logger.error(`Error fetching m3u8: ${err.message}`);
      throw new InternalServerErrorException('Error occurred while fetching application/x-mpegURL data');
    }
  }

  @Get('transcode')
  async transcodeSegment(@Query('url') url: string, @Res() res: Response) {
    const reqUrl = this.validateUrl(url);

    // spawn ffmpeg to transcode audio to AAC LC and output MPEG-TS to stdout
    // ffmpeg must be installed on the host and available in PATH
    try {
      const ffmpegArgs = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', reqUrl,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-f', 'mpegts',
        'pipe:1',
      ];

      const ff = spawn('ffmpeg', ffmpegArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

      // forward stderr to logs for debugging
      ff.stderr.on('data', (chunk) => {
        this.logger.error(`ffmpeg: ${chunk.toString()}`);
      });

      ff.on('error', (err) => {
        this.logger.error(`ffmpeg spawn error: ${err.message}`);
        if (!res.headersSent) res.status(HttpStatus.BAD_GATEWAY).send('Transcode failed');
      });

      res.setHeader('Content-Type', 'video/MP2T');
      res.setHeader('Cache-Control', 'no-cache');

      // pipe ffmpeg stdout to response
      ff.stdout.pipe(res);

      // when ffmpeg exits, end the response if not already ended
      ff.on('close', (code, signal) => {
        if (!res.writableEnded) res.end();
        this.logger.log(`ffmpeg exited code=${code} signal=${signal}`);
      });
    } catch (err: any) {
      this.logger.error(`Transcode error: ${err.message}`);
      throw new InternalServerErrorException('Transcode failed');
    }
  }

  @Get('text')
  async getText(@Query('url') url: string, @Res({ passthrough: true }) res: Response) {
    const reqUrl = this.validateUrl(url);
    try {
      const data = await this.proxy.fetchText(reqUrl);
      res.setHeader('Content-Type', 'text/plain');
      return data;
    } catch (err: any) {
  this.logger.error(`Error fetching text: ${err.message}`);
      throw new InternalServerErrorException('Error occurred while fetching text/plain data');
    }
  }

  @Get('json')
  async getJson(@Query('url') url: string, @Res({ passthrough: true }) res: Response) {
    const reqUrl = this.validateUrl(url);
    try {
      const data = await this.proxy.fetchJson(reqUrl);
      res.setHeader('Content-Type', 'application/json');
      return data;
    } catch (err: any) {
  this.logger.error(`Error fetching json: ${err.message}`);
      throw new InternalServerErrorException('Error occurred while fetching application/json data');
    }
  }
}