// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authservice: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // looks for "Bearer TOKEN"
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: any) {
    this.authservice.validateJwtUser(payload.sub);
    return { userId: payload.sub, email: payload.email }; // attached to req.user
  }
}
