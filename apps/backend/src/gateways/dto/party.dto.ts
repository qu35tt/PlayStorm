import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PartyUser{
    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    avatarUrl: string
}

export class JoinParty{
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    avatarUrl: string

    @IsString()
    @IsNotEmpty()
    roomId: string
}

export class DisconnectResult {
    @IsString()
    @IsNotEmpty()
    roomId: string

    user: PartyUser

    updatedUserList: PartyUser[]

    newHostId?: string
}

export class PlaybackData {
    @IsString()
    @IsNotEmpty()
    videoId: string

    @IsNumber()
    @IsNotEmpty()
    currentTime: number
}

export enum PlayerAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK_FRW = 'SEEK_FRW',
  SEEK_BCK = 'SEEK_BCK',
}