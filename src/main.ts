/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap')
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true, //remueve los parametros que no se modifican o usan
      forbidNonWhitelisted:true, // te trata como error los parametros que no estan definidos en el DTO
      transform:true, // activate tranforms dto value to income
      transformOptions: {
        enableImplicitConversion:true,
      }
    })
  )
  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`)
}
bootstrap();
