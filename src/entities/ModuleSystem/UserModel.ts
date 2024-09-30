/* eslint-disable mongoose-lean/require-lean */
import { TypeHelper, UserAccountTypes, UserAuthFlow, UserTypes } from "@startup-engine/shared";
import bcrypt from "bcrypt";
import uniqueValidator from "mongoose-unique-validator";
import { SpeedGooseCacheAutoCleaner } from "speedgoose";
import { ExtractDoc, Type, createSchema, typedModel } from "ts-mongoose";

const mongooseHidden = require("mongoose-hidden")();

const userSchema = createSchema(
  {
    name: Type.string(),
    role: Type.string({
      required: true,
      default: UserTypes.Regular,
      enum: TypeHelper.enumToStringArray(UserTypes),
    }),
    authFlow: Type.string({
      required: true,
      default: UserAuthFlow.Basic,
      enum: TypeHelper.enumToStringArray(UserAuthFlow),
    }),
    email: Type.string({ required: true, unique: true }),
    password: Type.string(),
    address: Type.string(),
    phone: Type.string(),
    salt: Type.string(),
    unsubscribed: Type.boolean({ default: false }),
    refreshTokens: Type.array().of({
      token: Type.string(),
    }),
    wallet: {
      publicAddress: Type.string(),
      networkId: Type.number(),
    },
    characters: Type.array().of(
      Type.objectId({
        ref: "Character",
      })
    ),
    accountType: Type.string({
      required: true,
      default: UserAccountTypes.Free,
      enum: TypeHelper.enumToStringArray(UserAccountTypes),
    }),

    isManuallyControlledPremiumAccount: Type.boolean({ default: false }),

    pushNotificationToken: Type.string({ default: null }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.index(
  {
    email: 1,
  },
  { background: true }
);

userSchema.plugin(SpeedGooseCacheAutoCleaner);

userSchema.plugin(uniqueValidator);

export type IUser = ExtractDoc<typeof userSchema>;

//  Hidden fields (not exposed through API responses)
userSchema.plugin(mongooseHidden, {
  hidden: {
    _id: false,
    password: true,
    salt: true,
    refreshTokens: true,
    createdAt: true,
    updatedAt: true,
  },
});

// Hooks ========================================

userSchema.pre("save", async function (next): Promise<void> {
  // @ts-ignore
  const user = this as IUser;
  user.email = user.email.toLocaleLowerCase();
  const salt = await bcrypt.genSalt();

  if (user.isModified("password")) {
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    user.salt = salt;
    next();
  }
});

export const User = typedModel("User", userSchema);
