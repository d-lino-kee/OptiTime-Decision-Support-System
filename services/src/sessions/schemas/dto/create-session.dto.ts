import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty()
  @IsMongoId()
  userId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  taskId?: string;

  @ApiProperty({ example: '2026-02-21T15:00:00.000Z' })
  @IsISO8601()
  startedAt!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  endedAt?: string;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interruptions?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}