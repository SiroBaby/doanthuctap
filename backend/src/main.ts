import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type,Authorization,Apollo-Require-Preflight,x-apollo-operation-name',
    credentials: true,
  };

  // Không cần multer global nữa
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Log incoming request
  app.use((req, res, next) => {
    console.log(
      'Incoming request:',
      req.method,
      req.url,
      req.body,
      'Files:',
      req.files,
    );
    next();
  });

  app.enableCors(corsOptions);
  app.use('/img', express.static(join(__dirname, '..', 'img')));

  await app.listen(process.env.PORT ?? 3301);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
