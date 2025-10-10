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
            const video = this.prisma.video.findUnique({
                where: {
                    id
                },
                select: {
                    URL: true,
                    name: true
                }
            })

            let res;

            // call external APIs but don't let them break the response
            try {
                const searchData = await this.animepahe.search("Monster");
                console.log('animepahe.search', searchData);

                const info = await this.animepahe.fetchAnimeInfo("f32622ae-856a-a6bf-1720-4f9688f93f39");
                console.log('fetchAnimeInfo', info);

                const sources = await this.animepahe.fetchEpisodeSources("f32622ae856aa6bf17204f9688f93f39/43df8adda0fe40bb3f45d9d4b3e471781a03b1072fee59bfe251923c45a9d080");
                console.log('fetchEpisodeSources', sources);
            } catch (extErr) {
                // log full error for debugging (status, body)
                console.warn('[VideoService] animepahe error:', {
                    message: (extErr as any)?.message,
                    status: (extErr as any)?.response?.status,
                    data: (extErr as any)?.response?.data
                });
                // optional: rethrow or return partial result. Here we continue and return DB video.
            }

            return video;
        }
        catch(err) {
            throw new InternalServerErrorException(err)
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
                    genre: true
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
}
