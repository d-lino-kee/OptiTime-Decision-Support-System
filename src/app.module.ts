import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './integrations/ai/ai.module';
import { MongoModule } from './integrations/mongo/mongo.module';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ReflectionsModule } from './reflections/reflections.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    AppConfigModule,
    MongoModule,
    AiModule,
    JobsModule,
    AuthModule,
    HealthModule,
    UsersModule,
    TasksModule,
    ReflectionsModule,
    SessionsModule,
    ChatModule,
  ],
})
export class AppModule {}