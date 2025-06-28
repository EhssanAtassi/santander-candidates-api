import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  // CROS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });
  // Swagger OpenAI configuration
  const config = new DocumentBuilder()
    .setTitle('Santander Candidates API')
    .setDescription(
      'API for managing job candidates with Excel file processing capabilities. ' +
        'This API allows you to create, read, update, and delete candidate records, ' +
        'including processing Excel files containing candidate technical information.',
    )
    .setVersion('1.0.0')
    .setContact(
      'Ihsan - Full Stack Developer',
      'https://github.com/your-username',
      'your-email@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('candidates', 'Candidate management operations')
    .addTag('upload', 'File upload operations')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://your-heroku-app.herokuapp.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Santander Candidates API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #ec0000; }
    `,
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(`Health Check: http://localhost:${port}/health`);
}

bootstrap();
