import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const express = require('express');
  const path = require('path');
  app.use('/images-service', express.static(path.join(process.cwd(), 'uploads/images-service')));
  app.use('/documents-tarifario', express.static(path.join(process.cwd(), 'uploads/documents-tarifario')));

  const port = parseInt(process.env.BACK_PORT || process.env.PORT || '3080', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`Backend escuchando en http://localhost:${port}`);
} 

bootstrap();
