import { createSchema, Type } from "ts-mongoose";

export const GemSchema = createSchema({
  key: Type.string(),
  name: Type.string(),
  gemStatBuff: Type.object().of({
    attack: Type.number({ required: false }),
    defense: Type.number({ required: false }),
  }),
  gemEntityEffectsAdd: Type.array({ required: false }).of(Type.string()),
  gemEntityEffectChance: Type.number({ required: false }),
});
