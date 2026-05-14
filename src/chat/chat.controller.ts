import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser, RequestUser } from '../common/decorators/req-user.decorator';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  send(@ReqUser() user: RequestUser, @Body() dto: SendMessageDto) {
    return this.chat.send(user._id.toString(), dto);
  }
}
