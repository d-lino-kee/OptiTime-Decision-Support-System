import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReflectionDocument = HydratedDocument<Reflection>;

@Schema({ timestamps: true })
export class Reflection {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  text!: string;

  // AI outputs (stored on the document for simplicity)
  @Prop()
  sentimentLabel?: string;

  @Prop()
  sentimentScore?: number;

  @Prop()
  sentimentConfidence?: number;
}

export const ReflectionSchema = SchemaFactory.createForClass(Reflection);
ReflectionSchema.index({ userId: 1, createdAt: -1 });
