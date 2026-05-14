import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

class ChatMessageHistoryItem {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  text!: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'How did my week go?' })
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiProperty({ required: false, type: [ChatMessageHistoryItem] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageHistoryItem)
  history?: ChatMessageHistoryItem[];
}
