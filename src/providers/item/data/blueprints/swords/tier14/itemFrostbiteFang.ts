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

export const itemFrostbiteFang: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.FrostbiteFang,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/frostbite-fang.png",
  name: "Frostbite Fang",
  description:
    "Forged from the fang of an ancient ice wyrm, this blade radiates icy cold, freezing foes with every savage strike.",
  attack: 102,
  defense: 90,
  tier: 14,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
  entityEffects: [EntityEffectBlueprint.Freezing],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: BasicAttribute.Resistance,
      buffPercentage: 7,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the frostbite fang flowing through your body. (+7% resistance)",
          deactivation: "You feel the power of the frostbite fang leaving your body. (-7% resistance)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases resistance by 7%",
};
