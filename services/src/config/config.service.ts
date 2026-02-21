import { Injectable } from '@nestjs/common';
import { Env } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(private readonly env: Env) {}

  get nodeEnv() {
    return this.env.NODE_ENV;
  }
  get port() {
    return this.env.PORT;
  }

  get mongoUri() {
    return this.env.MONGODB_URI;
  }
  get mongoDb() {
    return this.env.MONGODB_DB;
  }

  get redisUrl() {
    return this.env.REDIS_URL;
  }

  get aiServiceUrl() {
    return this.env.AI_SERVICE_URL;
  }
  get weaviateUrl() {
    return this.env.WEAVIATE_URL;
  }

  get serviceAuthSecret() {
    return this.env.SERVICE_AUTH_SECRET;
  }
}