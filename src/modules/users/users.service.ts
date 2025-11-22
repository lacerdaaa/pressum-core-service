import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanStatus, UserPlan } from '../../common/enums/plan.enum';
import { UserRole } from '../../common/enums/role.enum';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { UserMetrics } from './interfaces/user-metrics.interface';
import { SubscriptionStatus } from '../../common/enums/billing.enum';
import { Subscription } from '../billing/entities/subscription.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
  ) {}

  async createUser(payload: {
    name: string;
    email: string;
    passwordHash: string;
    plan?: UserPlan;
    planStatus?: PlanStatus;
    role?: UserRole;
  }): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: payload.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash: payload.passwordHash,
      plan: payload.plan ?? UserPlan.FREE,
      planStatus: payload.planStatus ?? PlanStatus.PENDING,
      planStartDate:
        payload.planStatus === PlanStatus.ACTIVE ? new Date() : null,
      metrics: this.getDefaultMetrics(),
      role: payload.role ?? UserRole.USER,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  async updatePlan(id: string, dto: UpdateUserPlanDto): Promise<User> {
    const user = await this.findById(id);
    user.plan = dto.plan;
    user.planStatus = dto.planStatus;
    if (dto.planStartDate) {
      user.planStartDate = new Date(dto.planStartDate);
    } else if (dto.planStatus === PlanStatus.ACTIVE && !user.planStartDate) {
      user.planStartDate = new Date();
    }
    return this.usersRepository.save(user);
  }

  async recordLogin(userId: string): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { lastLoginAt: new Date() },
    );
  }

  async upsertMetrics(userId: string, metrics: Partial<UserMetrics>) {
    const user = await this.findById(userId);
    user.metrics = { ...this.getDefaultMetrics(), ...user.metrics, ...metrics };
    await this.usersRepository.save(user);
  }

  async getPaymentHistory(userId: string) {
    const user = await this.findById(userId);
    const planStart = user.planStartDate ?? new Date();
    return [
      {
        id: `mock-${user.plan}-${planStart.getTime()}`,
        amount:
          user.plan === UserPlan.PREMIUM
            ? 79.9
            : user.plan === UserPlan.INTENSIVE
              ? 129.9
              : 0,
        status: user.planStatus,
        paidAt: planStart,
        plan: user.plan,
        currency: 'BRL',
      },
    ];
  }

  private getDefaultMetrics(): UserMetrics {
    return {
      completedAttempts: 0,
      averageScore: 0,
      totalStudyMinutes: 0,
    };
  }

  async resolveActivePlan(userId: string): Promise<{
    plan: UserPlan;
    planStatus: PlanStatus;
    planStartDate?: Date | null;
    planEndDate?: Date | null;
  }> {
    const activeSubscription = await this.subscriptionsRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });

    if (activeSubscription?.plan) {
      return {
        plan: activeSubscription.plan.code as UserPlan,
        planStatus: PlanStatus.ACTIVE,
        planStartDate: activeSubscription.startedAt ?? new Date(),
        planEndDate: activeSubscription.endsAt ?? null,
      };
    }

    // Fallback para usuário (sem assinatura ativa)
    const user = await this.findById(userId);
    return {
      plan: user.plan ?? UserPlan.FREE,
      planStatus: user.planStatus ?? PlanStatus.PENDING,
      planStartDate: user.planStartDate ?? null,
      planEndDate: user.planEndDate ?? null,
    };
  }
}
