import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { EssaySupportingText } from './entities/supporting-text.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { FilterExamsDto } from './dto/filter-exams.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionType } from '../../common/enums/exam.enum';
import { FilterQuestionsDto } from './dto/filter-questions.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam) private readonly examsRepository: Repository<Exam>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(QuestionOption)
    private readonly optionsRepository: Repository<QuestionOption>,
    @InjectRepository(EssaySupportingText)
    private readonly supportingTextsRepository: Repository<EssaySupportingText>,
  ) {}

  async findAll(query: FilterExamsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const qb = this.examsRepository.createQueryBuilder('exam');

    if (query.search) {
      qb.andWhere(
        '(LOWER(exam.title) LIKE :search OR LOWER(exam.description) LIKE :search)',
        {
          search: `%${query.search.toLowerCase()}%`,
        },
      );
    }

    if (query.area) {
      qb.andWhere(':area = ANY(exam.areas)', { area: query.area });
    }

    if (query.difficulty) {
      qb.andWhere('exam.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    qb.take(pageSize)
      .skip((page - 1) * pageSize)
      .orderBy('exam.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  }

  async findQuestions(query: FilterQuestionsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const qb = this.questionsRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.exam', 'exam');

    if (query.search) {
      qb.andWhere(
        '(LOWER(question.text) LIKE :search OR LOWER(question.area) LIKE :search OR LOWER(COALESCE(question.subarea, \'\')) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.area) {
      qb.andWhere('LOWER(question.area) = :area', {
        area: query.area.toLowerCase(),
      });
    }

    if (query.type) {
      qb.andWhere('question.type = :type', { type: query.type });
    }

    if (query.examId) {
      qb.andWhere('exam.id = :examId', { examId: query.examId });
    }

    qb.orderBy('question.createdAt', 'DESC')
      .take(pageSize)
      .skip((page - 1) * pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      pagination: {
        total,
        page,
        pageSize,
      },
    };
  }

  async findQuestionById(id: string) {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['options', 'supportingTexts', 'exam'],
      order: {
        options: { createdAt: 'ASC' },
        supportingTexts: { createdAt: 'ASC' },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  async findOne(id: string) {
    const exam = await this.examsRepository.findOne({
      where: { id },
      relations: [
        'questions',
        'questions.options',
        'questions.supportingTexts',
      ],
      order: { questions: { createdAt: 'ASC' } },
    });

    if (!exam) {
      throw new NotFoundException('Simulado not found');
    }

    return exam;
  }

  async create(dto: CreateExamDto, createdBy?: string) {
    const exam = this.examsRepository.create({
      ...dto,
      createdBy,
      hasEssay: dto.hasEssay ?? false,
    });

    return this.examsRepository.save(exam);
  }

  async addQuestion(examId: string, dto: CreateQuestionDto) {
    const exam = await this.examsRepository.findOne({ where: { id: examId } });
    if (!exam) {
      throw new NotFoundException('Simulado not found');
    }

    const question = this.questionsRepository.create({
      ...dto,
      exam,
      options:
        dto.options?.map((option) => this.optionsRepository.create(option)) ??
        [],
      supportingTexts:
        dto.supportingTexts?.map((text) =>
          this.supportingTextsRepository.create(text),
        ) ?? [],
    });

    const savedQuestion = await this.questionsRepository.save(question);
    if (!exam.hasEssay && dto.type === QuestionType.ESSAY) {
      exam.hasEssay = true;
      await this.examsRepository.save(exam);
    }
    await this.updateTotalQuestions(examId);
    return savedQuestion;
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: ['options', 'supportingTexts'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    Object.assign(question, dto);

    if (dto.options) {
      question.options = dto.options.map((option) =>
        this.optionsRepository.create(option),
      );
    }

    if (dto.supportingTexts) {
      question.supportingTexts = dto.supportingTexts.map((text) =>
        this.supportingTextsRepository.create(text),
      );
    }

    return this.questionsRepository.save(question);
  }

  async removeQuestion(questionId: string) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: ['exam'],
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.questionsRepository.remove(question);
    await this.updateTotalQuestions(question.exam.id);
    return { deleted: true };
  }

  private async updateTotalQuestions(examId: string) {
    const count = await this.questionsRepository.count({
      where: { exam: { id: examId } },
    });
    await this.examsRepository.update(
      { id: examId },
      { totalQuestions: count },
    );
  }
}
