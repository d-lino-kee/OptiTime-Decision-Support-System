import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@APITags('health')
@Controller('health')
export class HealthController {
    @Get()
    ping() {
        return { ok: true, service: 'optitime-api', timestamp: new Date().toISOString() };
    }
}