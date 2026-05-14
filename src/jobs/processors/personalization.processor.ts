import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PersonalizationUpdatePayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.PERSONALIZATION)
export class PersonalizationProcessor extends WorkerHost {
  private readonly logger = new Logger(PersonalizationProcessor.name);

  async process(job: Job<PersonalizationUpdatePayload>): Promise<void> {
    const { userId, triggeredBy } = job.data;
    if (!userId) {
      this.logger.log(`Personalization cron tick (${triggeredBy ?? 'cron'}) — fan-out is a future task`);
      return;
    }
    // Personalization refresh: would call AI service to recompute user recommendations.
    // Kept as a no-op in MVP so the queue stays drained and observable.
    this.logger.log(`Personalization refresh requested for ${userId} (${triggeredBy})`);
  }
}
