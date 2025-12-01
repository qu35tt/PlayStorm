import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { ANIME } from "@consumet/extensions"

@Injectable()
export class VideoService {
    constructor(private prisma: PrismaService) {}
    private animepahe = new ANIME.Gogoanime()

    getVideos() {
        try{
            const videos = this.prisma.video.findMany({
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
            const video = await this.prisma.video.findUnique({
                where: {
                    id
                },
                select: {
                    URL: true,
                    name: true
                }
            })

            if (!video) throw new NotFoundException('Video not found');

            return video;
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
                    URL: true,
                    length: true
                }
            });

            if (!episode) throw new NotFoundException('Episode not found');
            
            return episode;
        } catch (err) {
            throw new InternalServerErrorException(err);
        }
    }

    getVideoData(id: string) {
        try{
            const video = this.prisma.video.findFirst({
                where: {
                    id
                },
                select: {
                    name: true,
                    banner: true,
                    genre: true,
                    videotype: true,
                    description: true,
                    seasons: {
                        orderBy: { number: 'asc' },
                        include: { 
                            episodes: {
                                orderBy: { number: 'asc' },
                                select: {
                                    id: true,
                                    title: true,
                                    number: true,
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
                }
            });

            return video;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async consumetTest() {
        try {
            let anime = new ANIME.AnimePahe();
            const results = await anime.fetchAnimeInfo("adb84358-8fec-fe80-1dc5-ad6218421dc1");
            console.log("Search completed:", results);
            return results;
        } catch (err) {
            console.error("Error in consumetTest:", err);
            throw new InternalServerErrorException("Failed to fetch anime data");
        }
    }
}
