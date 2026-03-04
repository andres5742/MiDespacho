import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const isProduction = process.env.NODE_ENV === 'production';
  let corsOrigin: boolean | string | string[] | ((origin: string) => boolean) = ['http://localhost:4200'];
  if (process.env.CORS_ORIGIN === '*') {
    corsOrigin = true;
  } else if (process.env.CORS_ORIGIN?.length) {
    corsOrigin = process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  } else if (isProduction) {
    corsOrigin = (origin: string) => !origin || /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin);
  }
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
