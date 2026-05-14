import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/config.service';
import { Reflection, ReflectionSchema } from '../reflections/schemas/reflection.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { JobsService } from './jobs.service';
import { EmbeddingsProcessor } from './processors/embeddings.processor';
import { PersonalizationProcessor } from './processors/personalization.processor';
import { SentimentProcessor } from './processors/sentiment.processor';
import { WeeklySummaryProcessor } from './processors/weekly-summary.processor';
import { QUEUES } from './queues';

@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [AppConfigService],
            useFactory: (cfg: AppConfigService) => ({
                connection: { url: cfg.redisUrl },
            }),
        }),
        BullModule.registerQueue(
            { name: QUEUES.embeddings },
            { name: QUEUES.summaries },
            { name: QUEUES.sentiment },
            { name: QUEUES.personalization },
        ),
        MongooseModule.forFeature([
            { name: Task.name, schema: TaskSchema },
            { name: Reflection.name, schema: ReflectionSchema },
        ]),
    ],
    providers: [
        JobsService,
        SentimentProcessor,
        EmbeddingsProcessor,
        WeeklySummaryProcessor,
        PersonalizationProcessor,
    ],
    exports: [JobsService],
})
export class JobsModule {}
