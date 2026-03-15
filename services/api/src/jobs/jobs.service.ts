import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  QUEUE_NAMES,
  JOB_NAMES,
  DEFAULT_JOB_OPTIONS,
  WeeklySummaryPayload,
  PersonalizationUpdatePayload,
  SentimentPayload,
  EmbedPayload,
} from './queues';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.WEEKLY_SUMMARY)
    private readonly weeklySummaryQueue: Queue,
    @InjectQueue(QUEUE_NAMES.PERSONALIZATION)
    private readonly personalizationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SENTIMENT)
    private readonly sentimentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EMBEDDINGS)
    private readonly embeddingsQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.registerRepeatingJobs();
  }

  private async registerRepeatingJobs() {
    await this.weeklySummaryQueue.add(
      JOB_NAMES.WEEKLY_SUMMARY,
      { triggerType: 'cron' },
      { repeat: { pattern: '0 23 * * 0' }, jobId: 'cron:weekly-summary' },
    );

    await this.personalizationQueue.add(
      JOB_NAMES.PERSONALIZATION_UPDATE,
      { triggerType: 'cron' },
      { repeat: { pattern: '0 3 * * *' }, jobId: 'cron:personalization-update' },
    );

    this.logger.log('Repeating jobs registered');
  }

  async enqueueSentiment(payload: SentimentPayload): Promise<void> {
    await this.sentimentQueue.add(JOB_NAMES.SENTIMENT_SINGLE, payload, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `sentiment:${payload.reflectionId}`,
    });
  }

  async enqueueEmbedUserData(payload: EmbedPayload): Promise<void> {
    await this.embeddingsQueue.add(JOB_NAMES.EMBED_USER_DATA, payload, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `embed:${payload.source}:${payload.sourceId}`,
    });
  }

  async triggerWeeklySummaryForUser(userId: string, weekStart: Date, weekEnd: Date): Promise<void> {
    const payload: WeeklySummaryPayload = {
      userId,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    };
    await this.weeklySummaryQueue.add(JOB_NAMES.WEEKLY_SUMMARY, payload, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `weekly-summary:${userId}:${weekStart.toISOString()}`,
    });
  }

  async triggerPersonalizationUpdate(userId: string): Promise<void> {
    const payload: PersonalizationUpdatePayload = { userId, triggeredBy: 'manual' };
    await this.personalizationQueue.add(JOB_NAMES.PERSONALIZATION_UPDATE, payload, {
      ...DEFAULT_JOB_OPTIONS,
      jobId: `personalization:${userId}:manual`,
    });
  }
}
