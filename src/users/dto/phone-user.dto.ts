import { IsPhoneNumber } from "class-validator";

export class PhoneVerifcationUserDto {
  @IsPhoneNumber("UZ")
  phone: string;
}
