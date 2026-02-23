import { Injectable, InternalServerErrorException, NotFoundException, Req } from '@nestjs/common';
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
                    email: true,
                    avatarUrl: true
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

    async uploadAvatar(id: string, file: Express.Multer.File) {
    try {
        if (!file) throw new InternalServerErrorException("No file provided");

        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException("User not found");

        // --- File info ---
        const fileExt = file.originalname.split(".").pop()?.toLowerCase();
        const bucket = "profile-pictures";
        const filePath = `${id}.${fileExt}`; // fixed structure, supports all types
        const contentType = file.mimetype;

        // --- Upload (safe overwrite) ---
        const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
            contentType,
            cacheControl: "0",
            upsert: true, // 👈 safely replaces old file if exists
        });
        if (error) throw new InternalServerErrorException(error.message);

        // --- Get public URL ---
        const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

        // --- Cache-busting to ensure user sees updated avatar ---
        const avatarUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

        // --- Save to DB ---
        const updatedUser = await this.prisma.user.update({
        where: { id },
        data: { avatarUrl },
        select: { avatarUrl: true, username: true },
        });

        return updatedUser;
        } catch (err) {
            throw new InternalServerErrorException(err.message || err);
        }
    }
}
