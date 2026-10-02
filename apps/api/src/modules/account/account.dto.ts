import { IsBoolean, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;
}

export class CreateAddressDto {
  @IsString()
  @Length(2, 80)
  label!: string;

  @IsString()
  @Length(2, 160)
  recipientName!: string;

  @IsString()
  @Length(2, 180)
  street!: string;

  @IsString()
  @Length(1, 20)
  number!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  complement?: string | null;

  @IsString()
  @Length(2, 120)
  district!: string;

  @IsString()
  @Length(2, 120)
  city!: string;

  @IsString()
  @Matches(/^[A-Za-z]{2}$/)
  state!: string;

  @IsString()
  @Matches(/^\d{5}-?\d{3}$/)
  postalCode!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Length(2, 80)
  label?: string;

  @IsOptional()
  @IsString()
  @Length(2, 160)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 180)
  street?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  complement?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  district?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  city?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2}$/)
  state?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/)
  postalCode?: string;
}

export class AddFavoriteDto {
  @IsString()
  @Length(2, 191)
  productId!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  newPassword!: string;
}
