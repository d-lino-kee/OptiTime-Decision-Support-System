import 'reflect-metadata';
import { NestFactor } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@/nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    app.use(helmet());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlaobalInterceptors(new RequestIdInterceptor());
    app.setGlobalPrefix('v1');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('OptiTime API')
        .setDescription('NestJS API for OptiTime')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, document);

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    await app.listen(port)
    // eslint-disable-next-line no-console
    console.log(`OptiTime API running on http://localhost:${port}/v1`);
}

bootstrap();