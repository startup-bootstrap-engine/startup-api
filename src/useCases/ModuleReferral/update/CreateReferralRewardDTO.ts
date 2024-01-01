import { tsDefaultDecorator } from "@providers/constants/ValidationConstants";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class CreateReferralRewardDTO {
  @IsDefined(tsDefaultDecorator("validation", "isNotEmpty"))
  @IsNotEmpty(tsDefaultDecorator("validation", "isNotEmpty"))
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  characterId: string;
}
