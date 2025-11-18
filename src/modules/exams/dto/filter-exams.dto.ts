import { Transform, TransformFnParams } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ExamDifficulty } from '../../../common/enums/exam.enum';

const parseQueryInteger = ({ value }: TransformFnParams) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const normalized =
    typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isNaN(normalized) ? undefined : normalized;
};

export class FilterExamsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsEnum(ExamDifficulty)
  difficulty?: ExamDifficulty;

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
