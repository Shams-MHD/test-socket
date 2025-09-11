import { NestFactory } from '@nestjs/core';
import { CommsApiModule } from './comms-api.module';
import * as cookieParser from 'cookie-parser';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(CommsApiModule);
  app.use(cookieParser());
  await app.listen(process.env.port ?? 3000);

  // const eventsGateway = app.get(EventsGateway);
  // setInterval(() => eventsGateway.sendMessage(/), 2000);
}
bootstrap();
