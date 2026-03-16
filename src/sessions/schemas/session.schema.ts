import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<FocusSession>;

@Schema({ timestamps: true })
export class FocusSession {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  taskId?: Types.ObjectId;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ default: 0 })
  interruptions!: number;

  @Prop()
  notes?: string;
}

export const FocusSessionSchema = SchemaFactory.createForClass(FocusSession);
FocusSessionSchema.index({ userId: 1, startedAt: -1 });