import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Job } from 'bullmq';
import { Model } from 'mongoose';
import { AiService } from '../../integrations/ai/ai.service';
import { Reflection, ReflectionDocument } from '../../reflections/schemas/reflection.schema';
import { Task, TaskDocument } from '../../tasks/schemas/task.schema';
import { EmbedPayload, QUEUE_NAMES } from '../queues';

@Processor(QUEUE_NAMES.EMBEDDINGS)
export class EmbeddingsProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingsProcessor.name);

  constructor(
    private readonly ai: AiService,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Reflection.name) private readonly reflectionModel: Model<ReflectionDocument>,
  ) {
    super();
  }

  async process(job: Job<EmbedPayload>): Promise<void> {
    const { userId, source, sourceId } = job.data;
    const text = await this.loadSourceText(source, sourceId);
    if (!text) {
      this.logger.warn(`No text for ${source}:${sourceId}, skipping`);
      return;
    }

    const result = await this.ai.embed({ userId, source, sourceId, text });
    this.logger.log(`Embedded ${source}:${sourceId} -> ${result.vectorId ?? 'ok'}`);
  }

  private async loadSourceText(source: string, sourceId: string): Promise<string | null> {
    if (source === 'task') {
      const t = await this.taskModel.findById(sourceId).lean();
      if (!t) return null;
      return [t.title, t.notes ?? '', (t.tags ?? []).join(' ')].filter(Boolean).join('\n');
    }
    if (source === 'reflection') {
      const r = await this.reflectionModel.findById(sourceId).lean();
      return r?.text ?? null;
    }
    return null;
  }
}
