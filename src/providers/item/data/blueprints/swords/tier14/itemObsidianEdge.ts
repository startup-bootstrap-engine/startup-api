import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  BasicAttribute,
  CharacterBuffDurationType,
  CharacterBuffType,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemObsidianEdge: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.ObsidianEdge,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/obsidian-edge.png",
  name: "Obsidian Edge",
  description:
    "Crafted from the molten heart of a volcano, this obsidian blade cuts through armor with searing heat, leaving behind a trail of destruction.",
  attack: 101,
  defense: 92,
  tier: 14,
  weight: 1.6,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 280,
  entityEffects: [EntityEffectBlueprint.Burning],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the frostbite fang flowing through your body. (+10% resistance)",
          deactivation: "You feel the power of the frostbite fang leaving your body. (-10% resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 10%",
};
