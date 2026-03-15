import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateReflectionDto {
  @ApiProperty()
  @IsMongoId()
  userId!: string;

  @ApiProperty({ example: 'Today I felt focused in the morning but got distracted after lunch.' })
  @IsString()
  @MinLength(3)
  text!: string;
}