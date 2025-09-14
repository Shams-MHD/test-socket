import { NestFactory } from '@nestjs/core';
import { CommsApiModule } from './comms-api.module';
import * as process from 'node:process';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    CommsApiModule,
    new FastifyAdapter(),
  );

  app.register(fastifyCookie)

  const port = process.env.PORT || 3000;
  await app.listen(port); 

  console.log(`Application is listening on port ${port}`);
  console.log(`Server running at: ${await app.getUrl()}`);
}

bootstrap();