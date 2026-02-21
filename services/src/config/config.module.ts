import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { validateEnv } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => validateEnv(config),
    }),
  ],
  providers: [
    {
      provide: AppConfigService,
      useFactory: () => {
        const env = validateEnv(process.env as any);
        return new AppConfigService(env);
      },
    },
  ],
  exports: [AppConfigService],
})
export class ConfigModule {}