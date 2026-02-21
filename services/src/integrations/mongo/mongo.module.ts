import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../../config/config.service';

@Module([
    imports: [
        MongooseModule.forRootAsync({
            inject: [AppConfigService],
            useFactor: (cfg: AppConfigService) => ({
                uri: cfg.mongoUri,
                dbName: cfg.mongoDb,
            }),
        }),
    ],
])
export class MongoModule {}