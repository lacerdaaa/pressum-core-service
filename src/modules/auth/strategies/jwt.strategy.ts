import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'supersecret',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const resolved = await this.usersService.resolveActivePlan(payload.sub);
      return {
        ...payload,
        plan: resolved.plan,
        planStatus: resolved.planStatus,
      };
    } catch {
      return payload;
    }
  }
}
