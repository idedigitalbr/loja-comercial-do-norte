import { EmailEventKey, PaymentEnvironment, RecordStatus, SmtpSecurity } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';
import type { EmailTemplateInput, NotificationPreferenceInput, PaymentSettingsInput, SiteBannerInput, SiteUpdateInput, SmtpSettingsInput } from './settings.types';

export class SiteUpdateDto implements SiteUpdateInput {
  @IsOptional() @IsString() @Length(2, 160) siteName?: string;
  @IsOptional() @IsString() @Length(1, 500) logoPath?: string | null;
  @IsOptional() @IsString() @Length(1, 500) faviconPath?: string | null;
  @IsOptional() @IsString() @Length(2, 255) address?: string | null;
  @IsOptional() @IsString() @Length(2, 40) phone?: string | null;
  @IsOptional() @IsString() @Length(2, 40) whatsapp?: string | null;
  @IsOptional() @IsUrl({ protocols: ['http', 'https'], require_protocol: true }) instagramUrl?: string | null;
  @IsOptional() @IsString() @Length(2, 180) title?: string | null;
  @IsOptional() @IsString() @Length(2, 4000) description?: string | null;
}

export class SiteBannerDto implements SiteBannerInput {
  @IsString() @Length(1, 500) desktopPath!: string;
  @IsOptional() @IsString() @Length(1, 500) mobilePath?: string | null;
  @IsOptional() @IsString() @Length(1, 120) eyebrow?: string | null;
  @IsOptional() @IsString() @Length(1, 220) title?: string | null;
  @IsOptional() @IsString() @Length(1, 4000) description?: string | null;
  @IsOptional() @IsString() @Length(1, 120) ctaLabel?: string | null;
  @IsOptional() @IsString() @Length(1, 500) ctaHref?: string | null;
  @IsOptional() @IsInt() @Min(0) @Max(9999) sortOrder?: number;
  @IsOptional() @IsEnum(RecordStatus) status?: RecordStatus;
}

export class PaymentSettingsDto implements PaymentSettingsInput {
  @IsOptional() @IsEnum(PaymentEnvironment) environment?: PaymentEnvironment;
  @IsOptional() @IsString() @Length(1, 500) accessToken?: string;
  @IsOptional() @IsString() @Length(1, 255) publicKey?: string | null;
  @IsOptional() @IsString() @Length(1, 500) webhookSecret?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsBoolean() enablePix?: boolean;
  @IsOptional() @IsBoolean() enableCard?: boolean;
}

export class SmtpSettingsDto implements SmtpSettingsInput {
  @IsOptional() @IsString() @Length(2, 255) host?: string | null;
  @IsOptional() @IsInt() @Min(1) @Max(65535) port?: number;
  @IsOptional() @IsString() @Length(1, 255) username?: string | null;
  @IsOptional() @IsString() @Length(1, 500) password?: string;
  @IsOptional() @IsEnum(SmtpSecurity) security?: SmtpSecurity;
  @IsOptional() @IsEmail() fromEmail?: string | null;
  @IsOptional() @IsString() @Length(1, 160) fromName?: string | null;
  @IsOptional() @IsEmail() replyTo?: string | null;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class EmailTemplateDto implements EmailTemplateInput {
  @IsString() @Length(1, 255) subject!: string;
  @IsString() @Length(1, 100000) htmlBody!: string;
  @IsString() @Length(1, 100000) textBody!: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class NotificationPreferenceDto implements NotificationPreferenceInput {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsEmail() recipientOverride?: string | null;
}

export class TemplateRouteParamsDto {
  @IsEnum(EmailEventKey) key!: EmailEventKey;
  @IsString() @Length(2, 10) locale!: string;
}
