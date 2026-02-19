-> create auth resource

-> npm i class-validator class-transformer
add this line in the main.ts file before port line
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

-> add user dtos
  -> create-user.dto.ts
      import { IsEmail, IsOptional, IsString } from 'class-validator';

      export class CreateUserDto {
        @IsString()
        name: string;

        @IsString()
        password: string;

        @IsEmail()
        email: string;

        @IsOptional()
        @IsString()
        bio?: string;

        @IsOptional()
        @IsString()
        avatar?: string;
      }

-> npm i bcrypt
   npm i -D @types/bcrypt

import * as bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

 const isMatch = await bcrypt.compare(
      signInDto.password ?? '',
      user.password,
    );


--------------------------------------------------------------------------------
------------------ This code is from Chat GPT --------------------
--------------------------------------------------------------------------------
npm install @nestjs/passport passport passport-jwt passport-local bcrypt @nestjs/jwt
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt


├─ auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SUPER_SECRET',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, PrismaService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}


├─ auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    console.log({ name, email, hashed });
    const user = await this.prisma.user.create({
      data: { name, email, password: hashed },
    });
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password!); // password is string now
    if (!isMatch) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}


├─ auth.controller.ts
// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // REGISTER
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.name, body.email, body.password);
  }

  // LOGIN (uses LocalStrategy)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  // PROTECTED ROUTE
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}



├─ local.strategy.ts
// auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // Passport expects 'username' by default
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user; // returned user is attached to req.user automatically
  }
}


├─ jwt.strategy.ts
// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // looks for "Bearer TOKEN"
      secretOrKey: process.env.JWT_SECRET || 'SUPER_SECRET',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email }; // attached to req.user
  }
}


├─ local-auth.guard.ts
// local-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
export class LocalAuthGuard extends AuthGuard('local') {}


├─ jwt-auth.guard.ts
// jwt-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
export class JwtAuthGuard extends AuthGuard('jwt') {}


POST /auth/register
{
  "name": "Ali",
  "email": "ali@test.com",
  "password": "123456"
}

POST /auth/login
{
  "email": "ali@test.com",
  "password": "123456"
}

{
  "access_token": "<JWT>",
  "user": { "id": 1, "name": "Ali", "email": "ali@test.com" }
}

GET /auth/profile
Authorization: Bearer <JWT>

