import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, StreamableFile, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaveProgressDto } from './dto/save-progress.dto';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { access, constants } from 'fs/promises';

@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);
    constructor(private prisma: PrismaService) {}

    async getVideos() {
        this.logger.log('Fetching all videos');
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
            this.logger.error(`Failed to fetch videos: ${err.message}`);
            throw new InternalServerErrorException(err)
        }
    }

    async streamVideo(id: string, filename: string): Promise<StreamableFile> {
        this.logger.log(`Streaming video: ${id} file: ${filename}`);
        try {
            const baseDir = path.join(process.cwd(), 'saved_videos', id);

            // Check if directory exists
            try {
                await access(baseDir, constants.F_OK);
            } catch {
                this.logger.warn(`Stream directory for ID ${id} not found.`);
                throw new NotFoundException(`Stream directory for ID ${id} not found.`);
            }

            // Map index.m3u8 to master.m3u8 if requested, or use the filename directly
            let actualFilename = filename;
            if (filename === 'index.m3u8') {
                // Check which one exists: master.m3u8 or index.m3u8
                try {
                    await access(path.join(baseDir, 'master.m3u8'), constants.F_OK);
                    actualFilename = 'master.m3u8';
                } catch {
                    actualFilename = 'index.m3u8';
                }
            }

            const requestedFile = path.join(baseDir, actualFilename);

            try {
                await access(requestedFile, constants.F_OK);
            } catch {
                this.logger.warn(`File ${filename} not found in stream folder.`);
                throw new NotFoundException(`File ${filename} not found in stream folder.`);
            }

            const fileStream = createReadStream(requestedFile);
            
            fileStream.on('error', (error) => {
                this.logger.error(`Stream error for file ${requestedFile}:`, error);
            });

            const contentType = filename.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t';

            return new StreamableFile(fileStream, { type: contentType });
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            this.logger.error(`Streaming error: ${err.message}`);
            throw new InternalServerErrorException(err.message || "Streaming error");
        }
    }

    async getVideoData(id: string, userId: string) {
        this.logger.log(`Fetching data for video: ${id} user: ${userId}`);
        try {
            // 1. Try to find if the ID belongs to an Episode
            const episode = await this.prisma.episode.findUnique({
                where: { id },
                include: {
                    watchProgress: {
                        where: { user_id: userId },
                        select: { last_position: true, isFinished: true }
                    },
                    season: {
                       include: {
                           video: {
                               include: { 
                                   genre: true,
                                   watchProgress: {
                                       where: { user_id: userId },
                                       select: { last_position: true, isFinished: true }
                                   }
                               }
                           }
                       }
                   }
               }
           });

           if (episode) {
               // Fetch all seasons and episodes for this series to enable autoplay logic on frontend
               const fullSeries = await this.prisma.video.findUnique({
                   where: { id: episode.season.videoId },
                   include: {
                       seasons: {
                           orderBy: { number: 'asc' },
                           include: {
                               episodes: {
                                   orderBy: { number: 'asc' },
                                   include: {
                                       watchProgress: {
                                           where: { user_id: userId },
                                           select: { last_position: true, isFinished: true }
                                       }
                                   }
                               }
                           }
                       }
                   }
               });

               return {
                    id: episode.id,
                    name: `${episode.season.video.name} - ${episode.title}`,
                    banner: episode.thumbnail || episode.season.video.banner,
                    description: episode.description || episode.season.video.description,
                    length: episode.length,
                    videotype: 'SERIES',
                    genre: episode.season.video.genre,
                    rls_year: episode.season.video.rls_year,
                    seriesName: episode.season.video.name,
                    episodeTitle: episode.title,
                    episodeNumber: episode.number,
                    seasonNumber: episode.season.number,
                    watchProgress: episode.watchProgress[0] ? {
                        ...episode.watchProgress[0],
                        last_position: Number(episode.watchProgress[0].last_position)
                    } : undefined,
                    // Pass the full series structure for navigation/autoplay
                    seasons: fullSeries?.seasons.map(season => ({
                        ...season,
                        episodes: season.episodes.map(ep => ({
                            ...ep,
                            watchProgress: ep.watchProgress[0] ? {
                                ...ep.watchProgress[0],
                                last_position: Number(ep.watchProgress[0].last_position)
                            } : undefined
                        }))
                    }))
                };
            }
   
            // 2. Fallback: Try to find if the ID belongs to a Video (Movie/Series root)
            const video = await this.prisma.video.findUnique({
                where: { id },
                include: {
                    genre: true,
                    watchProgress: {
                        where: { user_id: userId },
                        select: { last_position: true, isFinished: true }
                    },
                    seasons: {
                        orderBy: { number: 'asc' },
                        include: {
                            episodes: {
                                orderBy: { number: 'asc' },
                                include: {
                                    watchProgress: {
                                        where: { user_id: userId },
                                        select: { last_position: true, isFinished: true }
                                    }
                                }
                            }
                        }
                    }
                }
            });
   
            if (!video) {
                this.logger.warn(`Content not found: ${id}`);
                throw new NotFoundException("Content not found");
            }
   
            return {
                ...video,
                watchProgress: video.watchProgress[0] ? {
                    ...video.watchProgress[0],
                    last_position: Number(video.watchProgress[0].last_position)
                } : undefined,
                seasons: video.seasons.map(season => ({
                    ...season,
                    episodes: season.episodes.map(episode => ({
                        ...episode,
                        watchProgress: episode.watchProgress[0] ? {
                            ...episode.watchProgress[0],
                            last_position: Number(episode.watchProgress[0].last_position)
                        } : undefined
                    }))
                }))
            };
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            this.logger.error(`Error fetching video data: ${err.message}`);
            throw new InternalServerErrorException(err);
        }
    }


    async getVideoProgress(userId: string, contentId: string) {
        this.logger.log(`Fetching progress for content: ${contentId} user: ${userId}`);
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
            this.logger.error(`Error fetching progress: ${err.message}`);
            throw new InternalServerErrorException(err);
        }
    }

    async saveProgress(userId: string, dto: SaveProgressDto) {
        this.logger.log(`Saving progress for user: ${userId} content: ${dto.videoId || dto.episodeId}`);
        try {
            const { videoId, episodeId, position, isFinished } = dto;

            if (!videoId && !episodeId) {
                throw new BadRequestException('Either videoId or episodeId must be provided');
            }

            // Find existing progress for this specific piece of content
            const existing = await this.prisma.watchProgress.findFirst({
                where: {
                    user_id: userId,
                    ...(episodeId 
                        ? { episode_id: episodeId } 
                        : { video_id: videoId, episode_id: null })
                }
            });

            let saved;

            if (existing) {
                saved = await this.prisma.watchProgress.upsert({
                    where: { id: existing.id },
                    data: { 
                        last_position: BigInt(position), 
                        isFinished,
                        // Ensure IDs are set if they were missing (e.g. videoId for an episode)
                        video_id: videoId || existing.video_id,
                        episode_id: episodeId || existing.episode_id
                    }
                });
            }
            else {
                saved = await this.prisma.watchProgress.create({
                    data: { 
                        user_id: userId,
                        video_id: videoId || null, 
                        episode_id: episodeId || null, 
                        last_position: BigInt(position), 
                        isFinished,
                        type: videoId ? 'MOVIE' : 'SERIES'
                    }
                });
            }
            
            return {
                isFinished: saved.isFinished,
                last_position: Number(saved.last_position)
            };

        } catch (err) {
            this.logger.error(`Error saving progress: ${err.message}`);
            throw new InternalServerErrorException(err);
        }
    }

    async getRandomVideo(){
        this.logger.log('Fetching random video');
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
            this.logger.error(`Error fetching random video: ${err.message}`);
            throw new InternalServerErrorException(err)
        }
    }

    async getAllGenres() {
        this.logger.log('Fetching all genres');
        try {
            const genres = await this.prisma.genre.findMany()

            return genres;
        }
        catch(err){
            this.logger.error(`Error fetching genres: ${err.message}`);
            throw new InternalServerErrorException(err)
        }
    }

    async getRecommendations(userId: string) {
        this.logger.log(`Fetching recommendations for user: ${userId}`);
        try {
            // 1. Find genres user has finished content for
            const finishedProgress = await this.prisma.watchProgress.findMany({
                where: {
                    user_id: userId,
                    isFinished: true,
                },
                select: {
                    video_id: true,
                    episode_id: true,
                    episode: {
                        select: {
                            season: {
                                select: {
                                    video: {
                                        select: {
                                            genre_id: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    video: {
                        select: {
                            genre_id: true
                        }
                    }
                }
            });

            // Extract genre IDs
            const genreCounts: Record<number, number> = {};
            finishedProgress.forEach(p => {
                const genreId = p.video?.genre_id || p.episode?.season.video.genre_id;
                if (genreId) {
                    genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
                }
            });

            // Get top 3 genres
            const topGenreIds = Object.entries(genreCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([id]) => parseInt(id));

            if (topGenreIds.length === 0) {
                // Fallback: return 5 random videos if no history
                const count = await this.prisma.video.count();
                const skip = Math.max(0, Math.floor(Math.random() * (count - 5)));
                return this.prisma.video.findMany({
                    skip,
                    take: 5,
                    include: { genre: true }
                });
            }

            // 2. Find videos from these genres not watched yet
            const watchedVideoIds = await this.prisma.watchProgress.findMany({
                where: { user_id: userId },
                select: { video_id: true }
            }).then(progress => progress.map(p => p.video_id).filter(Boolean) as string[]);

            const recommendations = await this.prisma.video.findMany({
                where: {
                    genre_id: { in: topGenreIds },
                    id: { notIn: watchedVideoIds }
                },
                take: 10,
                include: { genre: true }
            });

            // Return 5 random from the 10 found (or fewer if less found)
            return recommendations.sort(() => 0.5 - Math.random()).slice(0, 5);

        } catch (err) {
            this.logger.error(`Error fetching recommendations: ${err.message}`);
            throw new InternalServerErrorException(err);
        }
    }
    }