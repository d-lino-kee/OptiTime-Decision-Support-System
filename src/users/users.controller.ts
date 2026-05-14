import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqUser, RequestUser } from '../common/decorators/req-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

    @Get('me')
    me(@ReqUser() user: RequestUser) {
        return this.users.findOne(user._id.toString());
    }

    @Patch('me')
    updateMe(@ReqUser() user: RequestUser, @Body() dto: UpdateUserDto) {
        return this.users.update(user._id.toString(), dto);
    }
}

