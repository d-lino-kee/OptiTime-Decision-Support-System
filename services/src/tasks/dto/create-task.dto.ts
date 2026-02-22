import { ApiProperty } from '@nestjs/swagger';
import { isArray, isEnum, isMongoId, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

const priority = ['low', 'medium', 'high'] as const;
const difficulty = ['easy', 'medium', 'hard'] as const;
const type = ['study', 'work', 'health', 'personal', 'other'] as const;

export class CreateTaskDto {
    @ApiProperty()
    @isMongoId()
    userId!: string;

    @ApiProperty({ exmaple: 'Finish calculus assignment' })
    @IsString()
    @MinLength(2)
    title!: string;

    @ApiProperty({ enum: priority })
    @isEnum(priority)
    priority!: (typeof priority)[number];

    @ApiProperty({ enum: difficulty })
    @isEnum(difficulty)
    difficulty!: (typeof difficulty)[number];

    @ApiProperty({ enum: type })
    @isEnum(type)
    type!: (typeof type)[number]

    @ApiProperty({ required: false })
    @IsOptional()
    dueAt?: string;

    @ApiProperty({ default: 30 })
    @IsNumber()
    @Min(1)
    estimatedMinutes!: number;

    @ApiProperty({ required: false, type: [string] })
    @IsOptional()
    @isArray()
    tags?: string[];
}