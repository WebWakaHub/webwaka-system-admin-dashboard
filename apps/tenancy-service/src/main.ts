import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TenantConfigService } from './config/tenant-config.service';

/**
 * WebWaka Tenancy Service Bootstrap
 *
 * Initialises the NestJS microservice for multi-tenant management.
 *
 * Nigeria-First: Default port 3002, locale en-NG, timezone Africa/Lagos.
 * Mobile-First: Compact JSON responses, paginated endpoints.
 * PWA-First: CORS configured for PWA client origins.
 * Offline-First: OfflineQueueService active from startup.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(TenantConfigService);

  // Global validation pipe — strict mode for production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS — configured for WebWaka PWA clients
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'X-Tenant-Slug',
      'X-Correlation-ID',
    ],
    credentials: true,
  });

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WebWaka Tenancy Service')
    .setDescription(
      'Multi-tenant lifecycle management API. Implements PostgreSQL RLS, tenant configuration isolation, and feature flag system.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-Tenant-ID', in: 'header' }, 'X-Tenant-ID')
    .addTag('tenants', 'Tenant lifecycle management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.port;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║          WebWaka Tenancy Service — CPA-02                    ║
╠══════════════════════════════════════════════════════════════╣
║  Port:     ${port}                                              ║
║  Env:      ${configService.nodeEnv.padEnd(10)}                              ║
║  Locale:   ${configService.defaultLocale.padEnd(10)} (Nigeria-First)            ║
║  Timezone: ${configService.defaultTimezone.padEnd(15)} (Nigeria-First)       ║
║  Currency: ${configService.defaultCurrency.padEnd(10)}                              ║
║  Docs:     http://localhost:${port}/docs                         ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
