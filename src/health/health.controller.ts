import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @Get()
  check() {
    const dbState = this.connection.readyState === 1 ? 'up' : 'down';
    return {
      status: dbState === 'up' ? 'ok' : 'degraded',
      mongodb: dbState,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
