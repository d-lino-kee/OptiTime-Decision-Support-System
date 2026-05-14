import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bullmq';
import { Model } from 'mongoose';
import { AiService } from '../../integrations/ai/ai.service';
import { Reflection, ReflectionDocument } from '../../reflections/schemas/reflection.schema';
import { QUEUE_NAMES, WeeklySummaryPayload } from '../queues';

@Processor(QUEUE_NAMES.WEEKLY_SUMMARY)
export class WeeklySummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(WeeklySummaryProcessor.name);

  constructor(
    private readonly ai: AiService,
    @InjectModel(Reflection.name) private readonly reflectionModel: Model<ReflectionDocument>,
  ) {
    super();
  }

  async process(job: Job<WeeklySummaryPayload>): Promise<void> {
    const { userId, weekStart, weekEnd } = job.data;
    if (!userId) {
      // Cron-trigger variant: fan-out per user would happen here. Skipping in MVP.
      this.logger.log('Weekly cron tick — fan-out per user is a future task');
      return;
    }

    const reflections = await this.reflectionModel
      .find({
        userId,
        createdAt: { $gte: new Date(weekStart), $lte: new Date(weekEnd) },
      })
      .select('text')
      .lean();

    if (!reflections.length) {
      this.logger.log(`No reflections for ${userId} in window`);
      return;
    }

    const summary = await this.ai.weeklySummary({
      userId,
      weekStart,
      weekEnd,
      reflections: reflections.map((r) => r.text),
    });

    this.logger.log(`Weekly summary for ${userId}: ${summary.summary.slice(0, 60)}…`);
  }
}
