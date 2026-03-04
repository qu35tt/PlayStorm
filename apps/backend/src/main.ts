import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isDev ? ['log', 'error', 'warn', 'debug', 'verbose'] : false,
  });

  const config = new DocumentBuilder()
    .setTitle("PlayStorm API")
    .setDescription("API for PlayStorm application")
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:80', 'http://localhost:6000'],
    credentials: true,
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
