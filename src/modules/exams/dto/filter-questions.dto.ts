import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsUUID } from 'class-validator';
import { QuestionType } from '../../../common/enums/exam.enum';

const parseQueryInteger = ({ value }: TransformFnParams) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized =
    typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isNaN(normalized) ? undefined : normalized;
};

export class FilterQuestionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsUUID()
  examId?: string;

  @IsOptional()
  @Transform(parseQueryInteger)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(parseQueryInteger)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
