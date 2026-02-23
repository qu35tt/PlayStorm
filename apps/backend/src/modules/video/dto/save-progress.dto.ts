import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SaveProgressDto {
  @IsOptional()
  @IsString()
  videoId?: string;

  @IsOptional()
  @IsString()
  episodeId?: string;

  @IsNumber()
  position: number;

  @IsBoolean()
  isFinished: boolean;
}
