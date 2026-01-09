import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VideoService {
    constructor(private prisma: PrismaService) {}

    async getVideos() {
        try{
            const videos = await this.prisma.video.findMany({
                take: 40,
                select: {
                    id: true,
                    name: true,
                    thumbnail: true,
                    videotype: true
                }
            })

            return videos;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async getVideo(id: string) {
        try{
            const episode = await this.prisma.episode.findUnique({
                where: {
                    id
                },
                select: {
                    id: true,
                    title: true,
                    length: true,
                    season: {
                        select: {
                            name: true,
                            video: {
                                select: {
                                    name: true,
                            }
                        }
                    }
                }
            }
        })
        
        if(episode) {
            return {
                type: 'EPISODE',
                name: `${episode.season.video.name} - ${episode.title}`,
            }
        }

        const video = await this.prisma.video.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                videotype: true,
                banner: true
            }
        });

        if(!video) throw new NotFoundException("Video does not exist")

        if (video.videotype === 'SERIES') {
            throw new BadRequestException('This is a Series container. Please provide a specific Episode ID.');
        }

        return {
            type: 'MOVIE',
            name: video.name,
        };

        }
        catch(err) {
            throw new InternalServerErrorException(err)
        }
    }

    async getEpisodeUrl(episodeId: string) {
        try {
            const episode = await this.prisma.episode.findUnique({
                where: { id: episodeId },
                select: {
                    id: true,
                    title: true,
                    length: true
                }
            });

            if (!episode) throw new NotFoundException('Episode not found');
            
            return episode;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    async getVideoData(id: string) {
        try{
            const video = await this.prisma.video.findFirst({
                where: {
                    id
                },
                select: {
                    name: true,
                    banner: true,
                    genre: true,
                    videotype: true,
                    description: true,
                    length: true,
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
                                }
                            }
                        }
                    }
                }
            })

            if(!video) throw new NotFoundException("Video does not exist")

            return video;
        }
        catch(err) {
            throw new InternalServerErrorException(err)
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
}
