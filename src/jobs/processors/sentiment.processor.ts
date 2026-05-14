import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bullmq';
import { Model } from 'mongoose';
import { AiService } from '../../integrations/ai/ai.service';
import { Reflection, ReflectionDocument } from '../../reflections/schemas/reflection.schema';
import { QUEUE_NAMES, SentimentPayload } from '../queues';

@Processor(QUEUE_NAMES.SENTIMENT)
export class SentimentProcessor extends WorkerHost {
  private readonly logger = new Logger(SentimentProcessor.name);

  constructor(
    private readonly ai: AiService,
    @InjectModel(Reflection.name) private readonly reflectionModel: Model<ReflectionDocument>,
  ) {
    super();
  }

  async process(job: Job<SentimentPayload>): Promise<void> {
    const { reflectionId } = job.data;
    const doc = await this.reflectionModel.findById(reflectionId).lean();
    if (!doc) {
      this.logger.warn(`Reflection ${reflectionId} not found, skipping`);
      return;
    }

    const result = await this.ai.analyzeSentiment(doc.text);
    await this.reflectionModel.updateOne(
      { _id: reflectionId },
      {
        $set: {
          sentimentLabel: result.label,
          sentimentScore: result.score,
          sentimentConfidence: result.confidence,
        },
      },
    );

    this.logger.log(`Sentiment for ${reflectionId}: ${result.label} (${result.score})`);
  }
}
