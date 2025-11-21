import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalInterceptors(new RequestLoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3001;
  const host = process.env.HOST ?? 'localhost';
  await app.listen(port, host);
  logger.log(`API listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
}

const logger = new Logger('Bootstrap');

void bootstrap().catch((error) => {
  const trace = error instanceof Error ? error.stack : undefined;
  logger.error('Failed to start application', trace);
  process.exit(1);
});
