import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ATStrategy } from './strategies/at.strategy';
import { JwtModule } from '@nestjs/jwt';
import { CommsApiModule } from '../comms-api.module';
import { PrismaModule } from './../../../../prisma/prisma.module';

@Module({
  imports: [JwtModule.register({}),PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, ATStrategy],
})
export class AuthModule {}
