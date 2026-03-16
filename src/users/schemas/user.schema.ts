import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true, sparse: true, trim: true })
    firebaseUid!: string;

    @Prop({ required: true, trim: true })
    displayName!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });