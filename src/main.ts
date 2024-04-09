import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes();
  app.enableCors();

  configureSwagger(app);

  await app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
}
bootstrap();

function configureSwagger(app) {
  const options = new DocumentBuilder()
    .setTitle('BizCRM')
    .setDescription(
      'API for BizCRM application that helps managing your business',
    )
    .setVersion('1.0.0')
    .addTag('nestjs')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
}
