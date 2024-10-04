import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateUserCardDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  card_name: string;

  @IsString()
  @IsNotEmpty()
  @Length(16, 16, { message: "Card number must be exactly 16 digits long" })
  number: string;

  @IsNumber()
  @Min(2024, { message: "Year must be the current or future year" })
  year: number;

  @IsNumber()
  @Min(1, { message: "Month must be between 1 and 12" })
  @Max(12, { message: "Month must be between 1 and 12" })
  month: number;
}
