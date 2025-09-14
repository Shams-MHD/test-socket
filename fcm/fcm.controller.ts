import { Controller, Post, Body, Get, HttpCode, HttpStatus, Res, Req, Param, Query } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { log } from 'console';

class RegisterTokenDto {
  token: string;
}

@Controller('fcm')
export class FcmController {
  constructor(private readonly fcmService: FcmService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  registerDevice(@Res() res:FastifyReply,@Body() body: RegisterTokenDto) {

    log('Registering token:', body.token);
    res.setCookie('fcm_token', body.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000, // 24 hours in milliseconds
    });    

    this.fcmService.saveDeviceToken(body.token);
    return res.send({ message: 'Token registered successfully' })
  }

  @Get('send-test')
  async sendTestNotification(): Promise<{ message: string }> {
    const result = await this.fcmService.sendTestNotification();
    return { message: result };
  }

  @Get('valid')
  async validateToken(@Req() request:FastifyRequest,@Res() response:FastifyReply):Promise<void>{
    
    const token=request.cookies['fcm_token']
    return response.send({valid:await this.fcmService.validateToken(token)});
  }
}