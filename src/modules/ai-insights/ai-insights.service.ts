import { ForbiddenException, Inject, Injectable, Logger, ServiceUnavailableException, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ResultsService } from '../results/results.service';
import { OPENAI_CLIENT } from './constants';
import { AttemptResultPayload } from '../../common/interfaces/result-analysis.interface';
import { AiInsightsPayload, AiInsightsResponse, AiQuestionSolutionPayload, AiQuestionSolutionResponse, } from '../../common/interfaces/ai-insights.interface';
import { ExamsService } from '../exams/exams.service';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PlanStatus, UserPlan } from '../../common/enums/plan.enum';
import { Question } from '../exams/entities/question.entity';

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private readonly model: string;

  constructor(
    private readonly resultsService: ResultsService,
    private readonly examsService: ExamsService,
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

      const parsed: unknown = JSON.parse(content);

      if (!this.isPartialAiInsightsPayload(parsed)) {
        throw new Error('Resposta inválida da OpenAI');
      }

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

  async generateQuestionSolution(
    questionId: string,
    user: JwtPayload,
    options?: { forceRefresh?: boolean },
  ): Promise<AiQuestionSolutionResponse> {
    if (
      user.planStatus !== PlanStatus.ACTIVE ||
      (user.plan !== UserPlan.PREMIUM && user.plan !== UserPlan.INTENSIVE)
    ) {
      throw new ForbiddenException(
        'Recurso disponível apenas para assinantes Premium ativos.',
      );
    }

    if (!this.openAiClient) {
      throw new ServiceUnavailableException(
        'OpenAI API não configurada. Defina OPENAI_API_KEY.',
      );
    }

    const question = await this.examsService.findQuestionById(questionId);

    if (!options?.forceRefresh && question.aiSolution && question.aiSolutionGeneratedAt) {
      return {
        ...question.aiSolution,
        generatedAt: question.aiSolutionGeneratedAt.toISOString(),
      };
    }

    const prompt = this.buildQuestionSolutionPrompt(question);

    try {
      const completion = await this.openAiClient.chat.completions.create({
        model: this.model,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Você é um professor especialista em concursos brasileiros. Receberá uma questão e deve explicar a alternativa correta, mostrando o passo a passo do raciocínio, dicas de estudo e armadilhas comuns. Responda em JSON com chaves explanation (string), stepByStep (array de strings), studyTips (array de strings) e commonPitfalls (array de strings). Seja objetivo e cite a alternativa correta claramente.',
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

      const parsed: unknown = JSON.parse(content);
      if (!this.isAiQuestionSolutionPayload(parsed)) {
        throw new Error('Resposta inválida da OpenAI');
      }

      const savedQuestion = await this.examsService.saveQuestionAiSolution(
        questionId,
        parsed,
      );

      return {
        ...parsed,
        generatedAt: savedQuestion.aiSolutionGeneratedAt?.toISOString() ?? new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Erro ao gerar resolução por IA', error as Error);
      throw new ServiceUnavailableException(
        'Não foi possível gerar a resolução com IA no momento.',
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
      `Principais pontos fortes: ${strengthsText || 'nenhum identificado'
      }`,
      `Principais pontos fracos: ${weaknessesText || 'nenhum identificado'
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

  private isPartialAiInsightsPayload(
    data: unknown,
  ): data is Partial<AiInsightsPayload> {
    return typeof data === 'object' && data !== null;
  }

  private isAiQuestionSolutionPayload(
    data: unknown,
  ): data is AiQuestionSolutionPayload {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const payload = data as Partial<AiQuestionSolutionPayload>;
    const isArrayOfStrings = (value: unknown) =>
      Array.isArray(value) && value.every((item) => typeof item === 'string');

    return (
      typeof payload.explanation === 'string' &&
      isArrayOfStrings(payload.stepByStep) &&
      isArrayOfStrings(payload.studyTips) &&
      isArrayOfStrings(payload.commonPitfalls)
    );
  }

  private buildQuestionSolutionPrompt(question: Question) {
    const optionsText = question.options
      ?.map(
        (option, index) =>
          `${String.fromCharCode(65 + index)}) ${option.text}${option.isCorrect ? ' (correta)' : ''
          }`,
      )
      .join('\n');

    const supportingTexts = question.supportingTexts
      ?.map(
        (text, index) =>
          `Texto ${index + 1}: ${text.title ?? 'Sem título'} - ${text.content
          }`,
      )
      .join('\n');

    return [
      `Área: ${question.area}${question.subarea ? ` / ${question.subarea}` : ''}`,
      `Tipo: ${question.type}`,
      `Enunciado: ${question.text}`,
      optionsText ? `Alternativas:\n${optionsText}` : null,
      question.supportText ? `Texto de apoio: ${question.supportText}` : null,
      supportingTexts ? `Textos extras:\n${supportingTexts}` : null,
      question.explanation
        ? `Explicação oficial existente: ${question.explanation}`
        : null,
      'Explique por que a resposta correta é a marcada como (correta) e dê dicas rápidas.',
    ]
      .filter(Boolean)
      .join('\n\n');
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
