import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateAttemptDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bookmarkedQuestionIds?: string[];
}
