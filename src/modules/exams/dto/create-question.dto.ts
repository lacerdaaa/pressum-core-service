import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../../../common/enums/exam.enum';

class QuestionOptionInput {
  @IsString()
  label: string;

  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

class EssaySupportingTextInput {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class CreateQuestionDto {
  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  subarea?: string;

  @IsOptional()
  @IsString()
  supportImage?: string;

  @IsOptional()
  @IsString()
  supportText?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  essayTopic?: string;

  @IsOptional()
  @IsString()
  essayGuidelines?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionInput)
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  options?: QuestionOptionInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EssaySupportingTextInput)
  supportingTexts?: EssaySupportingTextInput[];
}
