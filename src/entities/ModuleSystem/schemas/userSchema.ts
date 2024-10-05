import { UserAccountTypes, UserAuthFlow, UserTypes } from "@startup-engine/shared";
import Joi from "joi";

export interface IUser {
  _id: string;
  name: string;
  role: string;
  authFlow: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  salt?: string;
  unsubscribed?: boolean;
  refreshTokens?: { token: string }[];
  wallet?: {
    publicAddress?: string;
    networkId?: number;
  };
  characters?: string[];
  accountType: string;
  isManuallyControlledPremiumAccount?: boolean;
  pushNotificationToken?: string | null;
  channelId?: string | null;
  // Timestamps can be added if needed
  createdAt?: Date;
  updatedAt?: Date;
}

export const userSchema = Joi.object({
  name: Joi.string().required(),

  role: Joi.string()
    .valid(...Object.values(UserTypes))
    .default(UserTypes.Regular)
    .required(),

  authFlow: Joi.string()
    .valid(...Object.values(UserAuthFlow))
    .default(UserAuthFlow.Basic)
    .required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).optional(), // Optional because Firebase may handle it differently

  address: Joi.string().optional(),

  phone: Joi.string().optional(),

  salt: Joi.string().optional(),

  unsubscribed: Joi.boolean().default(false),

  refreshTokens: Joi.array()
    .items(
      Joi.object({
        token: Joi.string().required(),
      })
    )
    .default([]),

  wallet: Joi.object({
    publicAddress: Joi.string().optional(),
    networkId: Joi.number().optional(),
  }).optional(),

  characters: Joi.array().items(Joi.string().optional()).default([]),

  accountType: Joi.string()
    .valid(...Object.values(UserAccountTypes))
    .default(UserAccountTypes.Free)
    .required(),

  isManuallyControlledPremiumAccount: Joi.boolean().default(false),

  pushNotificationToken: Joi.string().optional().allow(null),

  channelId: Joi.string().optional().allow(null),
}) as Joi.ObjectSchema<IUser>;
