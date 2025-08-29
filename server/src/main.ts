import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir peticiones del frontend
  app.enableCors({
    origin: 'http://localhost:3000', // Frontend
    credentials: true,
  });
  
  await app.listen(3001); // Puerto específico para el backend
}
bootstrap();
