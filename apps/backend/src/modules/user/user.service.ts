import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDataDto } from './dto';
import { createClient } from "@supabase/supabase-js"
const argon = require('argon2');

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUser(id: string) {
        try{
            const user = await this.prisma.user.findUnique({
                where: {
                    id
                },
                select: {
                    username: true,
                    email: true
                }
            })

            if(!user) throw new NotFoundException("User with this id does not exist")

            return user;
        }
        catch(err){
            throw new InternalServerErrorException(err)
        }
    }

    async updateUser(dto: UserDataDto, id: string){
        try{
            let hash: string | undefined;
            if(dto.password){ 
                hash = await argon.hash(dto.password); 
            }
                
            const updateUser = await this.prisma.user.update({
                where: {
                    id
                },
                data: {
                    username: dto.username,
                    email: dto.email,
                    password: hash 
                }
            })

            return updateUser;
        }
        catch(err){
            throw new InternalServerErrorException(err);
        }
    }

    async uploadAvatar(id: string, file:Express.Multer.File){
        try{
            if(!file) throw new InternalServerErrorException("No File Provided");

            const fileExt = file.originalname.split('.').pop();
            const fileName = `${id}.${fileExt}`;
            const filePath = `/${fileName}`;

            const { data, error } = await supabase.storage
                .from('profile-pictures') // your bucket name
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600',
                upsert: false,
            });

            if (error) {
                throw new InternalServerErrorException(error.message);
            }

            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return { url: publicUrlData.publicUrl };
        }
        catch(err){
            throw new InternalServerErrorException(err);
        }
    }
}
