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
