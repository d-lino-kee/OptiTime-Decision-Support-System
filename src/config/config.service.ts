import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  get mongoUri(): string {
    return this.config.getOrThrow<string>('MONGODB_URI');
  }

  get mongoDb(): string {
    return this.config.get<string>('MONGODB_DB', 'optitime');
  }

  get redisUrl(): string {
    return this.config.getOrThrow<string>('REDIS_URL');
  }

  get weaviateUrl(): string {
    return this.config.getOrThrow<string>('WEAVIATE_URL');
  }

  get weaviateApiKey(): string | undefined {
    return this.config.get<string>('WEAVIATE_API_KEY');
  }

  get aiServiceUrl(): string {
    return this.config.getOrThrow<string>('AI_SERVICE_URL');
  }

  get aiServiceHmacSecret(): string {
    return this.config.getOrThrow<string>('AI_SERVICE_HMAC_SECRET');
  }

  get firebaseProjectId(): string {
    return this.config.getOrThrow<string>('FIREBASE_PROJECT_ID');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
