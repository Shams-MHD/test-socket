import { Module } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { FcmController } from './fcm.controller';
import { PrismaModule } from './../../../../prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [FcmController],
  providers: [FcmService],
})
export class FcmModule {}
