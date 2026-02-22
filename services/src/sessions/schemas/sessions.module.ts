import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FocusSession, FocusSessionSchema } from './schemas/session.schema';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: FocusSession.name, schema: FocusSessionSchema }])],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}