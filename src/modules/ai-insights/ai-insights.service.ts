/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ResultsService } from '../results/results.service';
import { OPENAI_CLIENT } from './constants';
import { AttemptResultPayload } from '../../common/interfaces/result-analysis.interface';
import {
  AiInsightsPayload,
  AiInsightsResponse,
} from '../../common/interfaces/ai-insights.interface';

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private readonly model: string;

  constructor(
    private readonly resultsService: ResultsService,
    private readonly configService: ConfigService,
    @Inject(OPENAI_CLIENT) private readonly openAiClient: OpenAI | null,
  ) {
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async generateInsights(
    attemptId: string,
    userId: string,
    options?: { forceRefresh?: boolean },
  ): Promise<AiInsightsResponse> {
    const resultEntity = await this.resultsService.getAttemptResultEntity(
      attemptId,
      userId,
    );

    if (!options?.forceRefresh && resultEntity.aiInsights) {
      return {
        ...resultEntity.aiInsights,
        generatedAt: resultEntity.aiInsightsGeneratedAt?.toISOString(),
      };
    }

    if (!this.openAiClient) {
      throw new ServiceUnavailableException(
        'OpenAI API não configurada. Defina OPENAI_API_KEY.',
      );
    }

    const result = await this.resultsService.getAttemptResult(
      attemptId,
      userId,
    );
    const prompt = this.buildPrompt(result);

    try {
      const completion = await this.openAiClient.chat.completions.create({
        model: this.model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é um coach especialista em preparação para provas brasileiras. Analise os dados fornecidos e devolva um JSON com campos summary, focusAreas (lista de {topic, reason}), actionPlan (lista de {title, description}), quickWins (array de strings curtas) e practiceDrills (lista de {title, frequency, tip}). Foque em sugestões concretas, em português do Brasil, mencionando métricas quando fizer sentido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const parsed = JSON.parse(content);
      const normalized = this.normalizeResponse(parsed);
      const savedResult = await this.resultsService.saveAiInsights(
        attemptId,
        userId,
        normalized,
      );

      return {
        ...normalized,
        generatedAt: savedResult.aiInsightsGeneratedAt?.toISOString(),
      };
    } catch (error) {
      this.logger.error('Erro ao gerar insights com IA', error as Error);
      throw new ServiceUnavailableException(
        'Não foi possível gerar insights com IA no momento.',
      );
    }
  }

  private buildPrompt(result: AttemptResultPayload): string {
    const summary = result.summary;
    const topStrengths = result.strengths.slice(0, 3);
    const topWeaknesses = result.weaknesses.slice(0, 3);
    const subjects = result.subjects
      .map(
        (subject) =>
          `${subject.name}: ${subject.correctCount}/${subject.totalCount} (${this.formatPercentage(
            subject.percentage,
          )}%)`,
      )
      .join('; ');

    const strengthsText = topStrengths
      .map(
        (item) =>
          `${item.name} - ${item.correctCount}/${item.totalCount} (${this.formatPercentage(
            item.percentage,
          )}%)`,
      )
      .join('; ');
    const weaknessesText = topWeaknesses
      .map(
        (item) =>
          `${item.name} - ${item.correctCount}/${item.totalCount} (${this.formatPercentage(
            item.percentage,
          )}%)`,
      )
      .join('; ');

    return [
      `Simulado: ${result.simulado.title}`,
      `Nota geral: ${summary.totalScore}/${summary.totalQuestions} (${this.formatPercentage(
        summary.percentage,
      )}%)`,
      `Tempo total: ${summary.totalTimeSeconds}s`,
      `Tempo médio por questão: ${summary.averageTimePerQuestion}s`,
      `Desempenho por matéria: ${subjects}`,
      `Principais pontos fortes: ${
        strengthsText || 'nenhum identificado'
      }`,
      `Principais pontos fracos: ${
        weaknessesText || 'nenhum identificado'
      }`,
      'Gere recomendações objetivas para evoluir nas próximas tentativas.',
    ].join('\n');
  }

  private formatPercentage(value?: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0.0';
    }
    return value.toFixed(1);
  }

  private normalizeResponse(data: Partial<AiInsightsPayload>): AiInsightsPayload {
    const focusAreas = Array.isArray(data.focusAreas) ? data.focusAreas : [];
    const actionPlan = Array.isArray(data.actionPlan) ? data.actionPlan : [];
    const practiceDrills = Array.isArray(data.practiceDrills)
      ? data.practiceDrills
      : [];

    return {
      summary:
        data.summary ??
        'Continue praticando; não foi possível gerar um resumo personalizado.',
      focusAreas: focusAreas.map((area) => ({
        topic: area.topic ?? 'Tópico prioritário',
        reason:
          area.reason ??
          'Aprofunde o estudo para converter este tema em um ponto forte.',
      })),
      actionPlan: actionPlan.map((item) => ({
        title: item.title ?? 'Ação recomendada',
        description:
          item.description ??
          'Detalhe indisponível. Reforce a revisão desta atividade.',
      })),
      quickWins: Array.isArray(data.quickWins) ? data.quickWins : [],
      practiceDrills: practiceDrills.map((drill) => ({
        title: drill.title ?? 'Prática sugerida',
        frequency: drill.frequency ?? '2x por semana',
        tip: drill.tip ?? 'Mantenha constância e revise os erros.',
      })),
    };
  }
}
