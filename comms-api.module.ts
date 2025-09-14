import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { FcmModule } from './fcm/fcm.module';
import { PrismaService } from './../../../prisma/prisma.service';

@Module({
  imports: [EventsModule, AuthModule, FcmModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommsApiModule {}
