import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskType = 'study' | 'work' | 'health' | 'personal' | 'other';

@Schema({ timestamps: true })
export class Task {
    @Prop({ type: Types.ObjectId, required: true, index: true })
    userId!: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ trim: true})
    notes?: string;

    @Prop({ required: true, enum: ['low', 'medium', 'high'] })
    priority!: TaskPriority;

    @Prop({ required: true, enum: ['easy', 'medium', 'hard']})
    difficulty!: TaskDifficulty;

    @Prop()
    dueAt?: Date;

    @Prop({ default: 30 })
    estimatedMinutes!: number;

    @Prop({ type: [String], default: [] })
    tags!: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, dueAt: 1})