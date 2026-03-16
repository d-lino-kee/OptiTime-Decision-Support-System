import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsModule } from '../jobs/jobs.module';
import { Reflection, ReflectionSchema } from './schemas/reflection.schema';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reflection.name, schema: ReflectionSchema }]), JobsModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService],
})
export class ReflectionsModule {}
