import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser, RequestUser } from '../common/decorators/req-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @ReqUser() user: RequestUser) {
    return this.sessions.create(dto, user._id.toString());
  }

  @Get()
  findByUser(@ReqUser() user: RequestUser) {
    return this.sessions.findByUser(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessions.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.sessions.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sessions.remove(id);
  }
}
