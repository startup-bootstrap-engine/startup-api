import { tsDefaultDecorator } from "@providers/constants/ValidationConstants";
import { IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReferralRewardDTO {
  @IsDefined(tsDefaultDecorator("validation", "isNotEmpty"))
  @IsNotEmpty(tsDefaultDecorator("validation", "isNotEmpty"))
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  characterId: string;

  @IsOptional()
  @IsString(tsDefaultDecorator("validation", "isType", { type: "string" }))
  deviceFingerprint?: string;
}
