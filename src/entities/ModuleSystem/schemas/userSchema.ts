import { UserAccountTypes, UserAuthFlow, UserTypes } from "@startup-engine/shared";
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1),

  role: z
    .nativeEnum(UserTypes, {
      required_error: "Role is required",
      invalid_type_error: "Role must be a valid UserType",
    })
    .default(UserTypes.Regular),

  authFlow: z
    .nativeEnum(UserAuthFlow, {
      required_error: "Auth flow is required",
      invalid_type_error: "Auth flow must be a valid UserAuthFlow",
    })
    .default(UserAuthFlow.Basic),

  email: z.string().email("Invalid email address"),

  password: z.string().min(6).optional(), // Optional because Firebase may handle it differently

  address: z.string().optional(),

  phone: z.string().optional(),

  salt: z.string().optional(),

  unsubscribed: z.boolean().default(false),

  refreshTokens: z
    .array(
      z.object({
        token: z.string(),
      })
    )
    .default([]),

  accountType: z
    .nativeEnum(UserAccountTypes, {
      required_error: "Account type is required",
      invalid_type_error: "Account type must be a valid UserAccountType",
    })
    .default(UserAccountTypes.Free),

  isManuallyControlledPremiumAccount: z.boolean().default(false),

  pushNotificationToken: z.string().nullable().optional(),

  channelId: z.string().nullable().optional(),
});

export type BaseIUser = z.infer<typeof userSchema>;

export interface IUser extends BaseIUser {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
