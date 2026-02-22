import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Alex Chen' })
    @IsString()
    @MinLength(2)
    displayname!: string;

    @ApiProperty({ example: 'alex@example.com' })
    @IsEmail()
    email!: string;
}