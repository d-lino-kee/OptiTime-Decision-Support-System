import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobsService } from '../jobs/jobs.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly jobs: JobsService,
  ) {}

  async create(dto: CreateTaskDto) {
    const created = await this.taskModel.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      tags: dto.tags ?? [],
    });

    // enqueue embedding for chatbot memory
    await this.jobs.enqueueEmbedUserData({
      userId: dto.userId,
      source: 'task',
      sourceId: String(created._id),
    });

    return created;
  }

  findByUser(userId: string) {
    return this.taskModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const task = await this.taskModel.findById(id).lean();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const updated = await this.taskModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      },
      { new: true },
    ).lean();

    if (!updated) throw new NotFoundException('Task not found');

    // re-embed if meaningful content changed (simple version: always)
    if (dto.userId) {
      await this.jobs.enqueueEmbedUserData({
        userId: dto.userId,
        source: 'task',
        sourceId: id,
      });
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.taskModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Task not found');
    return { ok: true };
  }
}