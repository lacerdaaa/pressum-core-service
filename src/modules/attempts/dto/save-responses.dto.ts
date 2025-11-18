import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class AttemptResponseInput {
  @IsString()
  questionId: string;

  @IsString()
  selectedOptionId: string;

  @IsInt()
  @Min(0)
  timeSpentSeconds: number;
}

export class SaveResponsesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttemptResponseInput)
  responses: AttemptResponseInput[];
}
