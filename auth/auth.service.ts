import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signUp(user: { username: string; password: string; id: number }) {
    return await this.signUser(user.id, 'user');
  }

  async signUser(userId: number, roleName: string) {
    const accessToken = await this.jwtService.signAsync(
      {
        id: userId,
        role: roleName,
      },
      {
        secret: 'jwt',
        expiresIn: 86400, // 60 * 60 * 24 : 24 hours
      },
    );

    return accessToken;
  }
}
