import { IsNotEmpty, IsOptional, IsString, IsUUID, Length, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  @IsNotEmpty()
  planCode: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false })
  returnUrl?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  completionUrl?: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 18)
  taxId: string;

  @IsString()
  @IsOptional()
  @Length(10, 16)
  cellphone?: string;
}
