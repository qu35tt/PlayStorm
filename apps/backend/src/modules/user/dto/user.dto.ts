import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserDataDto{
    @IsString()
    @IsNotEmpty()
    username?: string

    @IsString()
    @IsNotEmpty()
    password?: string

    @IsNotEmpty()
    @IsEmail()
    email?: string
} 