import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function start() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api")

    const config = new DocumentBuilder()
      .setTitle('Stadium-Locator')
      .setDescription('Your little helper in searching Stadiums.')
      .addTag('NestJS, Sequelize(pg), PostgreSQL, Class-validator, RestAPI')
      .setVersion('0.0.1')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    await app.listen(PORT, () => {
      console.log(`Server working at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
