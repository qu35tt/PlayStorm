import { Injectable, InternalServerErrorException, NotFoundException, Req, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(UserService.name);
    constructor(private prisma: PrismaService) {}

    async getUser(id: string) {
        this.logger.log(`Fetching user profile for: ${id}`);
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

            if(!user) {
                this.logger.warn(`User profile not found for: ${id}`);
                throw new NotFoundException("User with this id does not exist")
            }

            return user;
        }
        catch(err){
            if (!(err instanceof NotFoundException)) {
                this.logger.error(`Error fetching user profile for ${id}: ${err.message}`);
            }
            throw err;
        }
    }

    async updateUser(dto: UserDataDto, id: string){
        this.logger.log(`Updating user profile for: ${id}`);
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
            this.logger.error(`Error updating user profile for ${id}: ${err.message}`);
            throw new InternalServerErrorException(err);
        }
    }

    async uploadAvatar(id: string, file: Express.Multer.File) {
    this.logger.log(`Uploading avatar for user: ${id}`);
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
        if (error) {
            this.logger.error(`Supabase upload error for ${id}: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }

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

        this.logger.log(`Avatar updated successfully for user: ${id}`);
        return updatedUser;
        } catch (err) {
            this.logger.error(`Error uploading avatar for user ${id}: ${err.message || err}`);
            throw new InternalServerErrorException(err.message || err);
        }
    }
}
