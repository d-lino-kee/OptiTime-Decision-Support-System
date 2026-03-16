import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { MongoModule } from './integrations/mongo/mongo.module';
import { RedisModule } from './integrations/redis/redis.module';
import { WeaviateModule } from './integrations/weaviate/weaviate.module';
import { JobsModule } from './jobs/jobs.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ReflectionsModule } from './reflections/reflections.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    AppConfigModule,
    MongoModule,
    RedisModule,
    WeaviateModule,
    JobsModule,
    AuthModule,
    HealthModule,
    UsersModule,
    TasksModule,
    ReflectionsModule,
    SessionsModule,
  ],
})
export class AppModule {}