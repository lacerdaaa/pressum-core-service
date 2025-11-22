import { DataSource } from 'typeorm';
import { Plan } from '../../modules/billing/entities/plan.entity';
import { PlanPeriod } from '../../common/enums/billing.enum';

export async function seedPlans(dataSource: DataSource) {
  const repo = dataSource.getRepository(Plan);

  const existing = await repo.find();
  if (existing.length > 0) {
    return;
  }

  const plans: Array<Partial<Plan>> = [
    {
      code: 'free',
      name: 'Free',
      description: 'Plano gratuito com limite de tentativas.',
      priceCents: 0,
      currency: 'BRL',
      period: PlanPeriod.MONTHLY,
      active: true,
      entitlements: { maxAttemptsPerMonth: 3, studyPlan: false },
    },
    {
      code: 'premium',
      name: 'Premium',
      description: 'Acesso completo com plano de estudos.',
      priceCents: 2999,
      currency: 'BRL',
      period: PlanPeriod.MONTHLY,
      active: true,
      entitlements: { maxAttemptsPerMonth: null, studyPlan: true },
    },
    {
      code: 'intensive',
      name: 'Intensive',
      description: 'Acesso completo com prioridade.',
      priceCents: 6999,
      currency: 'BRL',
      period: PlanPeriod.MONTHLY,
      active: true,
      entitlements: { maxAttemptsPerMonth: null, studyPlan: true, priority: true },
    },
  ];

  await repo.save(plans);
}
