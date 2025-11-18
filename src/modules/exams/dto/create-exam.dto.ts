import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ExamDifficulty } from '../../../common/enums/exam.enum';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(30)
  @Max(360)
  durationMinutes: number;

  @IsInt()
  @Min(30)
  @Max(360)
  timeLimitMinutes: number;

  @IsInt()
  @Min(1)
  totalQuestions: number;

  @IsEnum(ExamDifficulty)
  difficulty: ExamDifficulty;

  @IsArray()
  @IsString({ each: true })
  areas: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  hasEssay?: boolean;
}
