import { Injectable } from '@nestjs/common';
import { AiService } from '../integrations/ai/ai.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly ai: AiService) {}

  async send(userId: string, dto: SendMessageDto) {
    const res = await this.ai.chat({
      userId,
      message: dto.message,
      history: dto.history,
    });
    return res;
  }
}
