import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Hoặc '*' nếu muốn cho phép tất cả
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true, // Nếu có sử dụng cookie hoặc token
  };

  app.enableCors(corsOptions);

  await app.listen(process.env.PORT ?? 3301);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
