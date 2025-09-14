import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,
    private readonly prisma:PrismaService
  ) {}


  async createProfile(user:{id:number,name:string}){
    return await this.prisma.profile.create({data:{name:user.name,userId:user.id,avatar:''}});
  }



  async signUser(roleName: string , user: { username: string; password: string}) {

    const newUser = await this.prisma.user.create({data:{username:user.username,password:user.password}})

    const accessToken = await this.jwtService.signAsync(
      {
        id: newUser.id,
        role: roleName,
      },
      {
        secret: 'jwt',
        expiresIn: 86400, // 60 * 60 * 24 : 24 hours
      },
    );

    // create two profiles 
    await this.prisma.profile.create({data:{name:user.username,userId:newUser.id,avatar:''}});
    await this.prisma.profile.create({data:{name:user.username,userId:newUser.id,avatar:''}});
  

    return accessToken;
  }
}
