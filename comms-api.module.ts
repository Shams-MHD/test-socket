import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { FcmModule } from './fcm/fcm.module';

@Module({
  imports: [EventsModule, AuthModule, FcmModule],
  providers: [],
})
export class CommsApiModule {}
