import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmg';
import { AppConfigService } from '../config/config.service';
import { QUEUES } from './queues';
import { JobsService } from './jobs.service';

@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [AppConfigService],
            useFactor: (cfg: AppConfigService) => ({
                connection: { url: cfg.redisUrl },
            }),
        }),
        BullModule.registerQueue(
            { name: QUEUES.embeddings },
            { name: QUEUES.summaries },
            { name: QUEUES.sentiment },
            { name: QUEUES.personalization },
        ),
    ],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule {}