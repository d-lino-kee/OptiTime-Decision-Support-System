import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobsService } from '../jobs/jobs.service';
import { CreateReflectionDto } from './dto/create-reflection.dto';
import { UpdateReflectionDto } from './dto/update-reflection.dto';
import { Reflection, ReflectionDocument } from './schemas/reflection.schema';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectModel(Reflection.name) private readonly reflectionModel: Model<ReflectionDocument>,
    private readonly jobs: JobsService,
  ) {}

  async create(dto: CreateReflectionDto) {
    const created = await this.reflectionModel.create({
      userId: new Types.ObjectId(dto.userId),
      text: dto.text,
    });

    await this.jobs.enqueueSentiment({ userId: dto.userId, reflectionId: String(created._id) });
    await this.jobs.enqueueEmbedUserData({ userId: dto.userId, source: 'reflection', sourceId: String(created._id) });

    return created;
  }

  findByUser(userId: string) {
    return this.reflectionModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const doc = await this.reflectionModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Reflection not found');
    return doc;
  }

  async update(id: string, dto: UpdateReflectionDto) {
    const updated = await this.reflectionModel.findByIdAndUpdate(
      id,
      { ...dto, userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined },
      { new: true },
    ).lean();
    if (!updated) throw new NotFoundException('Reflection not found');

    if (dto.userId) {
      await this.jobs.enqueueSentiment({ userId: dto.userId, reflectionId: id });
      await this.jobs.enqueueEmbedUserData({ userId: dto.userId, source: 'reflection', sourceId: id });
    }

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.reflectionModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Reflection not found');
    return { ok: true };
  }
}