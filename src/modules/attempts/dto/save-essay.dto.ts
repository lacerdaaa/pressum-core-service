import { IsInt, IsString, Min } from 'class-validator';

export class SaveEssayDto {
  @IsString()
  questionId: string;

  @IsString()
  content: string;

  @IsInt()
  @Min(0)
  wordCount: number;
}
