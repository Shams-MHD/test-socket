import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') return true;
    const client: Socket = context.switchToWs().getClient();

    WsJwtGuard.validateToken(client);
    return true;
  }

  static validateToken(client: Socket) {
    const cookies = client.handshake.headers.cookie;
    
    if (!cookies) {
      throw new UnauthorizedException('No cookies found');
    }
    
    const cookieArray = cookies.split(';');
    const accessTokenCookie = cookieArray.find(cookie => 
      cookie.trim().startsWith('accessToken=')
    )
    
    if (!accessTokenCookie) {
      throw new UnauthorizedException('Access token not found in cookies');
    }
    
    const token = accessTokenCookie.split('=')[1];
    const payload = verify(token, 'jwt');
    return payload;
  }
}
