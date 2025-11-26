import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PartyUser{
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
}

export class PlaybackData {
    @IsString()
    @IsNotEmpty()
    videoId: string

    @IsNumber()
    @IsNotEmpty()
    current_time: number

    @IsNotEmpty()
    last_update: Date
}

export enum PlayerAction {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  SEEK_FORWARD = 'SEEK_FORWARD',
  SEEK_BACKWARD = 'SEEK_BACKWARD',
}