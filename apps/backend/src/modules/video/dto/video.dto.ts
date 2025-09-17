import { IsNotEmpty, IsString } from "class-validator";

export class VideoDto{
    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    thumbnail: string

    @IsString()
    @IsNotEmpty()
    lenght: number
}