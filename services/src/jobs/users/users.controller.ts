import { Body, Controller, Delete, Get, Param, patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.users.create(dto);
    }

    @Get(':id')
    findOne(@Param('id') id : string) {
        return this.users.findOne(id);
    }

    @patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.users.update(id, dto);
    }
}

