import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateReflectionDto {
  @ApiProperty({ example: 'Today I felt focused in the morning but got distracted after lunch.' })
  @IsString()
  @MinLength(3)
  text!: string;
}