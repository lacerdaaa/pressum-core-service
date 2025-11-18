import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FinishAttemptDto {
  @IsInt()
  @Min(0)
  totalTimeSeconds: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  timeRemainingSeconds?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bookmarkedQuestionIds?: string[];
}
