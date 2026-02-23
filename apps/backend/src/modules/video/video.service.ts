import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import * as fs from 'fs';
import * as path from 'path';
import Ffmpeg, * as ffmpeg from 'fluent-ffmpeg';
import { createReadStream } from 'fs';

// Set ffprobe path
const ffprobePath = require('ffprobe-static').path;
Ffmpeg.setFfprobePath(ffprobePath);

@Injectable()
export class VideoService {
    constructor(private prisma: PrismaService) {}

    async getVideos() {
        // ... (keeping getVideos logic)
        try{
            const videos = await this.prisma.video.findMany({
                take: 40,
                select: {
                    id: true,
                    name: true,
                    thumbnail: true,
                    videotype: true,
                    genre_id: true,
                    watchProgress: {
                        select: {
                            last_position: true,
                            isFinished: true
                        }
                    }
                }
            })

            return videos.map((video) => ({
                ...video,
                watchProgress: video.watchProgress.map((progress) => ({
                    ...progress,
                    last_position: Number(progress.last_position),
                })),
            }));
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async streamVideo(id: string, filename: string): Promise<StreamableFile> {
        try {
            const baseDir = path.join(process.cwd(), 'saved_videos', id);

            // Check if directory exists
            if (!fs.existsSync(baseDir)) {
                throw new NotFoundException(`Stream directory for ID ${id} not found.`);
            }

            // Map index.m3u8 to master.m3u8 if requested, or use the filename directly
            let actualFilename = filename;
            if (filename === 'index.m3u8') {
                // Check which one exists: master.m3u8 or index.m3u8
                actualFilename = fs.existsSync(path.join(baseDir, 'master.m3u8'))
                    ? 'master.m3u8'
                    : 'index.m3u8';
            }

            const requestedFile = path.join(baseDir, actualFilename);

            if (!fs.existsSync(requestedFile)) {
                throw new NotFoundException(`File ${filename} not found in stream folder.`);
            }

            const fileStream = fs.createReadStream(requestedFile);
            const contentType = filename.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t';

            return new StreamableFile(fileStream, { type: contentType });
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException(err.message || "Streaming error");
        }
    }

    async getVideoData(id: string) {
        try {
            // 1. Try to find if the ID belongs to an Episode
            const episode = await this.prisma.episode.findUnique({
                where: { id },
                include: {
                    season: {
                       include: {
                           video: {
                               include: { genre: true }
                           }
                       }
                   }
               }
           });
           if (episode) {
               // It's an episode: Return combined data (Series name + Episode title)
               return {
                   id: episode.id,
                    name: `${episode.season.video.name} - ${episode.title}`,
                    banner: episode.thumbnail || episode.season.video.banner, // Fallback to series banner
                    description: episode.description || episode.season.video.description,
                    length: episode.length,
                    videotype: 'SERIES',
                    genre: episode.season.video.genre,
                    rls_year: episode.season.video.rls_year,
                    // Extra metadata for Series UI if needed
                    seriesName: episode.season.video.name,
                    episodeTitle: episode.title,
                    episodeNumber: episode.number,
                    seasonNumber: episode.season.number
                };
            }
   
            // 2. Fallback: Try to find if the ID belongs to a Video (Movie/Series root)
            const video = await this.prisma.video.findUnique({
                where: { id },
                include: {
                    genre: true,
                    seasons: {
                        orderBy: { number: 'asc' },
                        include: {
                            episodes: {
                                orderBy: { number: 'asc' },
                                select: {
                                    id: true,
                                    title: true,
                                    length: true,
                                    thumbnail: true,
                                    description: true,
                                    number: true,
                                }
                            }
                        }
                    }
                }
            });
   
            if (!video) throw new NotFoundException("Content not found");
   
            return video;
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException(err);
        }
    }


    async getVideoProgress(userId: string, contentId: string) {
        try {
            const progress = await this.prisma.watchProgress.findFirst({
                where: { 
                    user_id: userId,
                    OR: [
                        { video_id: contentId },
                        { episode_id: contentId }
                    ]
                },
                select: {
                    last_position: true,
                    isFinished: true
                }
            });

            if (!progress) return { last_position: 0, isFinished: false };

            return {
                ...progress,
                last_position: Number(progress.last_position) // Convert BigInt to Number for JSON
            };
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async saveProgress(userId: string, dto: SaveProgressDto) {
        try {
            const { videoId, episodeId, position, isFinished } = dto;

            if (!videoId && !episodeId) {
                throw new BadRequestException('Either videoId or episodeId must be provided');
            }

            const existing = await this.prisma.watchProgress.findFirst({ where: {
                user_id: userId,
                video_id: videoId
            } });

            let saveProgress;

            if (existing) {
                saveProgress = await this.prisma.watchProgress.update({
                    where: { id: existing.id },
                    data: { last_position: position, isFinished, }
                });
            }
            else{
                saveProgress = await this.prisma.watchProgress.create({
                    data: { 
                        user_id: userId,
                        video_id: videoId || undefined, 
                        episode_id: episodeId || undefined, 
                        last_position: position, 
                        isFinished,
                        type: videoId ? 'MOVIE' : 'SERIES'
                    }
                });

            }
            return {
                isFinished: saveProgress.isFinished,
                last_position: Number(saveProgress.last_position)
            };

        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async getRandomVideo(){
        try{
            const count = await this.prisma.video.count();
            if (count === 0) throw new NotFoundException('No videos found');

            const randomIndex = Math.floor(Math.random() * count);

            const [video] = await this.prisma.video.findMany({
                skip: randomIndex,
                take: 1,
                select: {
                    id: true,
                    name: true,
                    banner: true,
                    description: true
                }
            });

            return video;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async getAllGenres() {
        try {
            const genres = await this.prisma.genre.findMany()

            return genres;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }
}