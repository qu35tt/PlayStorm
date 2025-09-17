import { IsEnum, IsNotEmpty, IsString } from "class-validator";

enum Controls {
    PLAY = 'play',
    FORWARD = 'forward',
    BACKWARD = 'backward'
}

export class PartyDto{
    @IsNotEmpty()
    @IsString()
    id: string;
}

export class InviteDto{
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    partyId: string;
}

export class ControlDto{
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEnum(Controls)
    control: Controls
}

export class Message{
    @IsNotEmpty()
    @IsString()
    partyId: string;

    @IsNotEmpty()
    @IsString()
    senderId: string;

    @IsNotEmpty()
    @IsString()
    text: string;
}