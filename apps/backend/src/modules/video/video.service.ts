import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VideoService {
    constructor(private prisma: PrismaService) {}

    getVideos() {
        try{
            const videos = this.prisma.video.findMany({
                take: 40
            })

            return videos;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    getVideo(id: string) {
        try{
            const video = this.prisma.video.findUnique({
                where: {
                    id
                },
                select: {
                    URL: true
                }
            })

            if(!video) throw new NotFoundException("Video does not exist")

            return video;
        }
        catch(err) {
            throw new InternalServerErrorException(err)
        }
    }
}
