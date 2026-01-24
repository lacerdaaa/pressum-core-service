import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamsModule } from './modules/exams/exams.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { ResultsModule } from './modules/results/results.module';
import { CommentsModule } from './modules/comments/comments.module';
import { BillingModule } from './modules/billing/billing.module';
import { AiInsightsModule } from './modules/ai-insights/ai-insights.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AiChatModule } from './modules/ai-chat/ai-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const sslEnabled =
          configService.get<string>('DATABASE_SSL', 'false') === 'true' ||
          (databaseUrl ? databaseUrl.includes('sslmode=require') : false);
        const ssl = sslEnabled ? { rejectUnauthorized: false } : undefined;

        const baseOptions = {
          type: 'postgres' as const,
          autoLoadEntities: true,
          synchronize:
            configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
          logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
          ssl,
        };

        if (databaseUrl) {
          return {
            ...baseOptions,
            url: databaseUrl,
          };
        }

        return {
          ...baseOptions,
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: parseInt(
            configService.get<string>('DATABASE_PORT', '5432'),
            10,
          ),
          username: configService.get<string>('DATABASE_USER', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', 'postgres'),
          database: configService.get<string>('DATABASE_NAME', 'pressum'),
        };
      },
    }),
    UsersModule,
    AuthModule,
    ExamsModule,
    AttemptsModule,
    ResultsModule,
    CommentsModule,
    BillingModule,
    AiInsightsModule,
    AiChatModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
