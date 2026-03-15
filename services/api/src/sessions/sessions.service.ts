import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { FocusSession, SessionDocument } from './schemas/session.schema';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(FocusSession.name) private readonly model: Model<SessionDocument>) {}

  create(dto: CreateSessionDto) {
    return this.model.create({
      userId: new Types.ObjectId(dto.userId),
      taskId: dto.taskId ? new Types.ObjectId(dto.taskId) : undefined,
      startedAt: new Date(dto.startedAt),
      endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      interruptions: dto.interruptions ?? 0,
      notes: dto.notes,
    });
  }

  findByUser(userId: string) {
    return this.model.find({ userId: new Types.ObjectId(userId) }).sort({ startedAt: -1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Session not found');
    return doc;
  }

  async update(id: string, dto: UpdateSessionDto) {
    const updated = await this.model.findByIdAndUpdate(
      id,
      {
        ...dto,
        userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
        taskId: dto.taskId ? new Types.ObjectId(dto.taskId) : undefined,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundException('Session not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Session not found');
    return { ok: true };
  }
}