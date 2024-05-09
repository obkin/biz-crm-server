import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  configureSwagger(app);

  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

function configureSwagger(app) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BizCRM')
    .setDescription(
      'API for BizCRM application that helps managing your business',
    )
    .setVersion('1.0.0')
    .addTag(
      'Node.js (nestjs + express), PostgreSQL (Typeorm), RestAPI, MySQL, Redis, Docker',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/api/docs', app, document);
}
