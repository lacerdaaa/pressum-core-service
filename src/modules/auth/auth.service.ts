import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PlanStatus, UserPlan } from '../../common/enums/plan.enum';
import { UserRole } from '../../common/enums/role.enum';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { type JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserMetrics } from '../users/interfaces/user-metrics.interface';

type PresentedUser = {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  planStatus: PlanStatus;
  planStartDate?: Date | null;
  planEndDate?: Date | null;
  role: UserRole;
  metrics?: UserMetrics | null;
  lastLoginAt?: Date | null;
  createdAt?: Date | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
      plan: dto.plan,
    });

    const tokens = await this.generateTokens(user);
    return { user: this.presentUser(user), tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.recordLogin(user.id);
    const tokens = await this.generateTokens(user);
    return { user: this.presentUser(user), tokens };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        dto.refreshToken,
        {
          secret: this.configService.get<string>(
            'JWT_REFRESH_SECRET',
            'supersecretrefresh',
          ),
        },
      );
      const user = await this.usersService.findById(payload.sub);
      const tokens = await this.generateTokens(user);
      return { user: this.presentUser(user), tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(currentUser: JwtPayload) {
    const user = await this.usersService.findById(currentUser.sub);
    const planResolved = await this.usersService.resolveActivePlan(currentUser.sub);
    return this.presentUser({ ...user, ...planResolved });
  }

  private async hashPassword(plain: string) {
    const saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );
    return bcrypt.hash(plain, saltRounds);
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      planStatus: user.planStatus ?? PlanStatus.PENDING,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role: user.role ?? UserRole.USER,
    };

    const accessExpires =
      (this.configService.get<string>('JWT_ACCESS_EXPIRES') ?? '1h') as
        JwtSignOptions['expiresIn'];
    const refreshExpires =
      (this.configService.get<string>('JWT_REFRESH_EXPIRES') ?? '7d') as
        JwtSignOptions['expiresIn'];

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_ACCESS_SECRET',
        'supersecret',
      ),
      expiresIn: accessExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(
        'JWT_REFRESH_SECRET',
        'supersecretrefresh',
      ),
      expiresIn: refreshExpires,
    });

    return { accessToken, refreshToken };
  }

  private presentUser(
    user: User & {
      plan?: UserPlan;
      planStatus?: PlanStatus;
      planStartDate?: Date | null;
      planEndDate?: Date | null;
    },
  ): PresentedUser {
     
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan as UserPlan,
      planStatus: user.planStatus as PlanStatus,
      planStartDate: user.planStartDate ?? null,
      planEndDate: user.planEndDate ?? null,
      role: (user.role ?? UserRole.USER) as UserRole,
      metrics: user.metrics,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
