import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [EventsModule, AuthModule],
  providers: [],
})
export class CommsApiModule {}
