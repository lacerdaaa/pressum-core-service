import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAiChatSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  contextType?: string;

  @IsOptional()
  @IsUUID()
  contextId?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}
