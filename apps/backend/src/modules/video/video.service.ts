import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProxyService } from '../proxy/proxy/proxy.service';

import { ANIME } from "@consumet/extensions"

@Injectable()
export class VideoService {
    constructor(private prisma: PrismaService, private proxy: ProxyService) {}
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

            let playlist: string | null = null;

            // call external APIs but don't let them break the response
            try {
                // example animepahe calls (non-blocking for playlist)
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
                // continue; external API errors do not break the DB response
            }

            // Use the proxy to fetch the m3u8 playlist if URL exists
            try {
                if (video.URL) {
                    // If your stored URL is already an m3u8, proxy.fetchText will return its contents.
                    // If the stored URL points to a page that resolves to an m3u8, adjust accordingly.
                    const proxied = await this.proxy.fetchText(video.URL);
                    playlist = proxied;
                }
            } catch (proxyErr) {
                console.warn('[VideoService] proxy fetch error:', (proxyErr as any)?.message);
                playlist = null; // don't fail the whole request
            }

            return {
                ...video,
                playlist,
            };
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
