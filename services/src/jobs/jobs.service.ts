import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from './queues';

@Injectable()
export class JobsService {
  constructor(
    @InjectQueue(QUEUES.embeddings) private readonly embeddingsQ: Queue,
    @InjectQueue(QUEUES.sentiment) private readonly sentimentQ: Queue,
    @InjectQueue(QUEUES.summaries) private readonly summariesQ: Queue,
    @InjectQueue(QUEUES.personalization) private readonly personalizationQ: Queue,
  ) {}

  enqueueEmbedUserData(payload: { userId: string; source: string; sourceId: string }) {
    return this.embeddingsQ.add('embed_user_data', payload, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
  }

  enqueueSentiment(payload: { userId: string; reflectionId: string }) {
    return this.sentimentQ.add('sentiment_single', payload, { attempts: 3 });
  }

  enqueueWeeklySummary(payload: { userId: string; weekStartISO: string }) {
    return this.summariesQ.add('weekly_summary', payload, { attempts: 3 });
  }

  enqueuePersonalizationUpdate(payload: { userId: string }) {
    return this.personalizationQ.add('personalization_update', payload, { attempts: 3 });
  }
}