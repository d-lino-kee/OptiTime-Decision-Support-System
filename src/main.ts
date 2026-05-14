// Must run before anything else so env vars like NODE_TLS_REJECT_UNAUTHORIZED and
// GOOGLE_APPLICATION_CREDENTIALS are visible by the time TLS / firebase-admin
// modules initialize. NestJS ConfigModule loads dotenv too, but that happens after
// these other modules have been imported.
import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    app.use(helmet());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new RequestIdInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    app.setGlobalPrefix('v1');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('OptiTime API')
        .setDescription('NestJS API for OptiTime')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/docs', app, document);

    const port = process.env.PORT ? Number(process.env.PORT) : 3001;
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`OptiTime API running on http://localhost:${port}/v1`);
}

bootstrap();