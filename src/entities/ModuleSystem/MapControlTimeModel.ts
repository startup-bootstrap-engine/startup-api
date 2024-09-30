import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { PeriodOfDay, TypeHelper } from "@startup-engine/shared";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";

const MapControlTimeSchema = createLeanSchema(
  {
    time: Type.string({ required: true }),
    period: Type.string({
      required: true,
      default: PeriodOfDay.Morning,
      enum: TypeHelper.enumToStringArray(PeriodOfDay),
    }),
    weather: Type.string({ required: true }),
  },
  { timestamps: { createdAt: true } }
);

MapControlTimeSchema.index(
  {
    time: 1,
  },
  { background: true }
);

export type IControlTime = ExtractDoc<typeof MapControlTimeSchema>;

export const MapControlTimeModel = typedModel("MapControlTime", MapControlTimeSchema);
