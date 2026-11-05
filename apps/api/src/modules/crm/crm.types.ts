import { LeadStage } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateNested } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  id!: string;

  @IsEnum(['bot', 'user'])
  sender!: 'bot' | 'user';

  @IsString()
  text!: string;

  @IsString()
  timestamp!: string;
}

export class CreateCrmLeadDto {
  @IsString()
  @MaxLength(160)
  customerName!: string;

  @IsString()
  @MaxLength(40)
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  customerEmail?: string;

  @IsString()
  @MaxLength(100)
  preferredStore!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  storeId?: string;

  @IsString()
  @MaxLength(200)
  subject!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  conversationLog?: ChatMessageDto[];
}

export class UpdateLeadStageDto {
  @IsEnum(LeadStage)
  stage!: LeadStage;
}

export class AddLeadNoteDto {
  @IsString()
  @MaxLength(2000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;
}

export class ListCrmLeadsQueryDto {
  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  storeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
