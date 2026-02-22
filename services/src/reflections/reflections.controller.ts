import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateReflectionDto } from './dto/create-reflection.dto';
import { UpdateReflectionDto } from './dto/update-reflection.dto';
import { ReflectionsService } from './reflections.service';

@ApiTags('reflections')
@Controller('reflections')
export class ReflectionsController {
  constructor(private readonly reflections: ReflectionsService) {}

  @Post()
  create(@Body() dto: CreateReflectionDto) {
    return this.reflections.create(dto);
  }

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.reflections.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reflections.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReflectionDto) {
    return this.reflections.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reflections.remove(id);
  }
}