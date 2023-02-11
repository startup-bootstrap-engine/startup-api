import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";
import { container } from "@providers/inversify/container";
import { EquipmentStatsCalculator } from "@providers/equipment/EquipmentStatsCalculator";
export const equipmentSchema = createLeanSchema(
  {
    owner: Type.objectId({
      refPath: "ownerRef", // ownerRef can be a Character or NPC!
      index: true,
    }),
    ownerRef: Type.string({
      enum: ["Character", "NPC"],
    }),
    head: Type.objectId({
      ref: "Item",
    }),
    neck: Type.objectId({
      ref: "Item",
    }),
    leftHand: Type.objectId({
      ref: "Item",
    }),
    rightHand: Type.objectId({
      ref: "Item",
    }),
    ring: Type.objectId({
      ref: "Item",
    }),
    legs: Type.objectId({
      ref: "Item",
    }),
    boot: Type.objectId({
      ref: "Item",
    }),
    accessory: Type.objectId({
      ref: "Item",
    }),
    armor: Type.objectId({
      ref: "Item",
    }),
    inventory: Type.objectId({
      ref: "Item",
    }),
    ...({} as {
      totalEquippedAttack: Promise<number>;
      totalEquippedDefense: Promise<number>;
    }),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

equipmentSchema.virtual("totalEquippedAttack").get(async function (this: IEquipment) {
  const equipamentStatsCalculator = container.get(EquipmentStatsCalculator);
  return (await equipamentStatsCalculator.getTotalEquipmentStats(this._id, "attack")) || 0;
});

equipmentSchema.virtual("totalEquippedDefense").get(async function (this: IEquipment) {
  const equipamentStatsCalculator = container.get(EquipmentStatsCalculator);
  return (await equipamentStatsCalculator.getTotalEquipmentStats(this._id, "defense")) || 0;
});

export type IEquipment = ExtractDoc<typeof equipmentSchema>;

export const Equipment = typedModel("Equipment", equipmentSchema);
