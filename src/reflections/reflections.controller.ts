import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser, RequestUser } from '../common/decorators/req-user.decorator';
import { CreateReflectionDto } from './dto/create-reflection.dto';
import { UpdateReflectionDto } from './dto/update-reflection.dto';
import { ReflectionsService } from './reflections.service';

@ApiTags('reflections')
@ApiBearerAuth()
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly reflections: ReflectionsService) {}

  @Post()
  create(@Body() dto: CreateReflectionDto, @ReqUser() user: RequestUser) {
    return this.reflections.create(dto, user._id.toString());
  }

  @Get()
  findByUser(@ReqUser() user: RequestUser) {
    return this.reflections.findByUser(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reflections.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReflectionDto, @ReqUser() user: RequestUser) {
    return this.reflections.update(id, dto, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reflections.remove(id);
  }
}
