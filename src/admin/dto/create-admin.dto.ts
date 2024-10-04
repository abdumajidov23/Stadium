import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 2,
    minSymbols: 2,
    minUppercase: 1,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirm_password: string;

  @IsString()
  @IsOptional()
  telegram_link: string;

  @IsString()
  @IsOptional()
  photo: string;
}
