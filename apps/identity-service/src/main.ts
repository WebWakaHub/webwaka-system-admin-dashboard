import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * WebWaka Identity Service — Bootstrap
 *
 * Starts the NestJS microservice with:
 * - Global validation pipe (whitelist + transform)
 * - Swagger/OpenAPI documentation at /api/docs
 * - CORS enabled for cross-origin requests
 * - Nigeria-First: Default port 3000
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS for mobile and PWA clients
  app.enableCors({
    origin: true, // Allow all origins in development
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('WebWaka Identity Service')
    .setDescription(
      'Identity System API — Authentication, Authorization, and User Management. ' +
      'Implements the 5-level actor hierarchy (Super Admin → Partner → Tenant Admin → Vendor → End User) ' +
      'with JWT-based authentication and tenant-scoped Row-Level Security (RLS). ' +
      'Nigeria-First, Offline-First, Mobile-First, PWA-First.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Login, logout, token refresh, password management')
    .addTag('Users', 'User CRUD with tenant-scoped access control')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════╗
║           WebWaka Identity Service v0.1.0                ║
║                                                          ║
║  API:     http://localhost:${port}/api/v1                    ║
║  Docs:    http://localhost:${port}/api/docs                  ║
║  Health:  http://localhost:${port}/api/v1/health              ║
║                                                          ║
║  Nigeria-First | Offline-First | Mobile-First | PWA-First║
╚══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
