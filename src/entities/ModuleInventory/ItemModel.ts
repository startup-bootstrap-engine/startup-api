import { CharacterView } from "@providers/character/CharacterView";
import { createLeanSchema } from "@providers/database/mongooseHelpers";
import { container } from "@providers/inversify/container";
import { ItemView } from "@providers/item/ItemView";
import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { MapHelper } from "@providers/map/MapHelper";
import { ItemRarities, ItemSlotType, ItemSubType, ItemType, MapLayers, TypeHelper } from "@rpg-engine/shared";
import { EntityAttackType, EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import { UpdateQuery } from "mongoose";
import { ExtractDoc, Type, typedModel } from "ts-mongoose";
import { ItemContainer } from "./ItemContainerModel";

import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment } from "@entities/ModuleCharacter/EquipmentModel";
import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";

import { ItemContainerHelper } from "@providers/itemContainer/ItemContainerHelper";
import { PlantLifeCycle } from "@providers/plant/data/types/PlantTypes";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { GemSchema } from "./GemSchema";

const itemSchema = createLeanSchema(
  {
    tiledId: Type.number(),
    owner: Type.objectId({
      ref: "Character",
      index: true,
    }),
    type: Type.string({
      required: true,
      default: ItemType.Other,
      enum: TypeHelper.enumToStringArray(ItemType),
    }),
    subType: Type.string({
      required: true,
      default: ItemSubType.Other,
      enum: TypeHelper.enumToStringArray(ItemSubType),
    }),
    rangeType: Type.string({
      enum: TypeHelper.enumToStringArray(EntityAttackType),
    }),
    entityType: Type.string({
      required: false,
    }),
    rarity: Type.string({
      default: ItemRarities.Common,
      enum: TypeHelper.enumToStringArray(ItemRarities),
    }),
    name: Type.string({ required: true }),
    description: Type.string({ required: true }),
    key: Type.string({ required: true, index: true }),
    textureAtlas: Type.string({ required: true, default: "items" }),
    texturePath: Type.string({ required: true }),
    attack: Type.number(),
    defense: Type.number(),
    weight: Type.number({ required: true }),
    allowedEquipSlotType: Type.array().of(Type.string({ enum: TypeHelper.enumToStringArray(ItemSlotType) })),
    maxStackSize: Type.number({ required: true, default: 1 }),
    stackQty: Type.number(),
    isUsable: Type.boolean({ required: true, default: false }),
    usableEffect: Type.mixed(),
    isStorable: Type.boolean({ required: true, default: true }),
    minRequirements: Type.object({ required: false }).of({
      level: Type.string,
      skill: {
        name: Type.string,
        level: Type.number,
      },
    }),
    x: Type.number(),
    y: Type.number(),
    scene: Type.string(),
    layer: Type.number({
      default: MapLayers.Decoration + 0.5,
    }),
    isItemContainer: Type.boolean({
      default: false,
      required: true,
    }),
    itemContainer: Type.objectId({
      ref: "ItemContainer",
    }),
    generateContainerSlots: Type.number(),
    isSolid: Type.boolean({ required: true, default: false }),
    ...({} as {
      isEquipable: boolean;
      fullDescription: string;
      baseKey: string;
    }),
    decayTime: Type.date(),
    maxRange: Type.number(),
    requiredAmmoKeys: Type.array({ required: false }).of(
      Type.string({ enum: TypeHelper.enumToStringArray(RangedWeaponsBlueprint) })
    ),
    isTwoHanded: Type.boolean({ required: true, default: false }),
    hasUseWith: Type.boolean({ required: true, default: false }),
    basePrice: Type.number(),
    canSell: Type.boolean({ required: true, default: true }),

    hasButchered: Type.boolean(),
    bodyFromId: Type.string(),

    canUseOnNonPVPZone: Type.boolean({ required: true, default: false }),

    isEquipped: Type.boolean({ required: true, default: false }),

    isTraining: Type.boolean({ required: true, default: false }), // For training items which gives a max damage of 1

    carrier: Type.objectId({
      ref: "Character",
    }),

    isInDepot: Type.boolean({ required: false }),

    deadBodyEntityType: Type.string({ required: false, enum: TypeHelper.enumToStringArray(EntityType) }),

    isDeadBodyLootable: Type.boolean({ required: false }),

    isInContainer: Type.boolean({ required: false }),

    isPersistent: Type.boolean({ required: false }),

    isStatic: Type.boolean({ required: false }),

    usableEffectDescription: Type.string({ required: false }),

    healthRecovery: Type.number({ required: false }),

    equippedBuffDescription: Type.string({ required: false }),

    entityEffects: Type.array().of(
      Type.string({
        typeof: EntityEffectBlueprint,
      })
    ),

    entityEffectChance: Type.number({ default: 0 }),

    tier: Type.number({ default: 1 }),

    growthPoints: Type.number({ required: false }),

    requiredGrowthPoints: Type.number({ required: false }),

    currentPlantCycle: Type.string({ required: false, enum: TypeHelper.enumToStringArray(PlantLifeCycle) }),

    lastPlantCycleRun: Type.date({ required: false }),

    lastWatering: Type.date({ required: false }),

    isRefillable: Type.boolean({ required: false }),

    remainingUses: Type.number({ required: false }),

    isDead: Type.boolean({ required: false }),

    timeOfDeath: Type.date({ required: false }),

    isTileTinted: Type.boolean({ required: false }),

    regrowthCount: Type.number({ required: false }),

    attachedGems: Type.array({ required: false }).of(GemSchema),
  },
  { timestamps: { createdAt: true, updatedAt: true } }
).plugin(updateIfCurrentPlugin);

itemSchema.index(
  { x: 1, y: 1, scene: 1, owner: 1, ItemContainer: 1, carrier: 1, key: 1, subType: 1, droppedBy: 1 },
  { background: true }
);

itemSchema.index({ type: 1, subType: 1, owner: 1, isItemContainer: 1 }, { background: true });
itemSchema.index({ type: 1, isDead: 1, currentPlantCycle: 1, lastWatering: -1 }, { background: true });
itemSchema.index({ owner: 1, isEquipped: 1 }, { background: true });
itemSchema.index({ isItemContainer: 1, itemContainer: 1 }, { background: true });
itemSchema.index({ x: 1, y: 1, scene: 1, layer: 1 }, { background: true });
itemSchema.index({ rarity: 1, tier: 1 }, { background: true });
itemSchema.index({ isUsable: 1, type: 1 }, { background: true });

itemSchema.virtual("baseKey").get(function (this: IItem) {
  return this.key.replace(/-\d+$/, "");
});

itemSchema.virtual("isEquipable").get(function (this: IItem) {
  return this.allowedEquipSlotType && this.allowedEquipSlotType.length > 0;
});

itemSchema.virtual("fullDescription").get(function (this: IItem): string {
  let message: string = "";
  message = `${this.name}: ${this.description}`;
  if (this.attack) {
    message += ` Attack: ${this.attack}.`;
  }
  if (this.defense) {
    message += ` Defense: ${this.defense}.`;
  }
  if (this.weight) {
    message += ` Weight: ${this.weight}.`;
  }
  if (this.rarity) {
    message += ` Rarity: ${this.rarity}.`;
  }
  return message;
});

export const warnAboutItemChanges = async (item: IItem, warnType: "changes" | "removal"): Promise<void> => {
  const mapHelper = container.get<MapHelper>(MapHelper);

  const hasCoordinates = item.x && item.y && item.scene;

  if (hasCoordinates && mapHelper.isCoordinateValid(item.x) && mapHelper.isCoordinateValid(item.y)) {
    const characterView = container.get<CharacterView>(CharacterView);
    const itemView = container.get<ItemView>(ItemView);

    const nearbyCharacters = await characterView.getCharactersAroundXYPosition(item.x!, item.y!, item.scene!);

    for (const character of nearbyCharacters) {
      if (warnType === "changes") {
        await itemView.warnCharacterAboutItemsInView(character);
      }

      if (warnType === "removal") {
        await itemView.warnCharactersAboutItemRemovalInView(item, item.x!, item.y!, item.scene!);
      }
    }
  }
};

itemSchema.post("updateOne", async function (this: UpdateQuery<IItem>) {
  const { _id } = this._conditions;
  if (!_id) return;

  // eslint-disable-next-line mongoose-lean/require-lean
  const updatedItem = (await Item.findById(_id)) as IItem | undefined;
  if (updatedItem) await warnAboutItemChanges(updatedItem, "changes");
});

itemSchema.post("save", async function (this: IItem) {
  if (this.isItemContainer && !this.itemContainer) {
    const itemContainerHelper = container.get<ItemContainerHelper>(ItemContainerHelper);
    const newContainer = await itemContainerHelper.generateItemContainerIfNotPresentOnItem(this);

    if (!newContainer) {
      throw new Error("Could not generate item container");
    }

    this.itemContainer = newContainer?._id;
  }

  await warnAboutItemChanges(this, "changes");
});

itemSchema.post("remove", async function (this: IItem) {
  await warnAboutItemChanges(this, "removal");

  if (this.isItemContainer) {
    await ItemContainer.deleteOne({ parentItem: this._id });
  }
});

itemSchema.pre("remove", async function (next) {
  const item = this as IItem;

  if (!item.owner) {
    next();
    return;
  }

  const character = (await Character.findById(item.owner).lean()) as ICharacter;

  if (!character.equipment) {
    return;
  }

  // eslint-disable-next-line mongoose-lean/require-lean
  const equipment = await Equipment.findById(character.equipment).cacheQuery({
    cacheKey: `${character._id}-equipment`,
  });

  const isEquipped = await equipment?.isEquipped(item._id);

  if (isEquipped) {
    next(new Error("Cannot delete item because it is equipped"));
  } else {
    next();
  }
});

itemSchema.pre("deleteOne", { document: false, query: true }, async function (next) {
  // The `this` here is a Query
  // @ts-ignore
  const skipEquipmentCheck: boolean = this.getOptions().skipEquipmentCheck;

  if (!skipEquipmentCheck) {
    // @ts-ignore
    const item = await this.model.findOne(this.getQuery());

    if (!item) {
      next();
      return;
    }

    if (!item.owner) {
      next();
      return;
    }

    const character = (await Character.findById(item.owner).lean()) as ICharacter;

    if (!character.equipment) {
      return;
    }

    // eslint-disable-next-line mongoose-lean/require-lean
    const equipment = await Equipment.findById(character.equipment).cacheQuery({
      cacheKey: `${character._id}-equipment`,
    });

    const isEquipped = equipment?.isEquipped(item._id);

    if (isEquipped) {
      next(new Error("Cannot delete item because it is equipped"));
      return;
    }
  }

  next();
});

export type IItem = ExtractDoc<typeof itemSchema>;

export const Item = typedModel("Item", itemSchema);
