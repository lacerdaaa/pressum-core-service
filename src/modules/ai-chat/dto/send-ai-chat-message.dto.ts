import { IsString, MaxLength } from 'class-validator';

export class SendAiChatMessageDto {
  @IsString()
  @MaxLength(4000)
  content: string;
}
