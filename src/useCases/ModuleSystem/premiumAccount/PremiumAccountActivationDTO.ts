import { UserAccountTypes } from "@startup-engine/shared";
import { IsDefined, IsEmail, IsEnum, IsNotEmpty } from "class-validator";

export class PremiumAccountActivationDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UserAccountTypes)
  accountType: UserAccountTypes;

  constructor(email: string, accountType: UserAccountTypes) {
    this.email = email;
    this.accountType = accountType;
  }
}
