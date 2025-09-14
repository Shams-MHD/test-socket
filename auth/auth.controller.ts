import { Controller, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {FastifyReply , FastifyRequest} from "fastify";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sign-in')
  async signIn(@Res() res:FastifyReply) {

    const token = await this.authService.signUser(1, 'user');
    res.setCookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400000, // 24 hours in milliseconds
    });    
    return res.send(token);
  }

  @Get('check')
  async check(@Req() req:FastifyRequest , @Res() res:FastifyReply) {

    const cookie = req.cookies['accessToken']
    if(!cookie) return 'no cookie';
    return res.send({cookie:cookie});
    
  }

  
}
