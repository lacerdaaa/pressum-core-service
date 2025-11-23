import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ResultsModule } from '../results/results.module';
import { AiInsightsService } from './ai-insights.service';
import { AiInsightsController } from './ai-insights.controller';
import { OPENAI_CLIENT } from './constants';

@Module({
  imports: [ConfigModule, ResultsModule],
  controllers: [AiInsightsController],
  providers: [
    AiInsightsService,
    {
      provide: OPENAI_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
          return null;
        }
        return new OpenAI({ apiKey });
      },
    },
  ],
})
export class AiInsightsModule {}
