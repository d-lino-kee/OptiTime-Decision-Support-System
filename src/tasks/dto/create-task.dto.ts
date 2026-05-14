import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    MinLength,
} from 'class-validator';

const priority = ['low', 'medium', 'high'] as const;
const difficulty = ['easy', 'medium', 'hard'] as const;
const type = ['study', 'work', 'health', 'personal', 'other'] as const;

export class CreateTaskDto {
    @ApiProperty({ example: 'Finish calculus assignment' })
    @IsString()
    @MinLength(2)
    title!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ enum: priority })
    @IsEnum(priority)
    priority!: (typeof priority)[number];

    @ApiProperty({ enum: difficulty })
    @IsEnum(difficulty)
    difficulty!: (typeof difficulty)[number];

    @ApiProperty({ enum: type })
    @IsEnum(type)
    type!: (typeof type)[number];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsISO8601()
    dueAt?: string;

    @ApiProperty({ default: 30 })
    @IsNumber()
    @Min(1)
    estimatedMinutes!: number;

    @ApiProperty({ required: false, type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
