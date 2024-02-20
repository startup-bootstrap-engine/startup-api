import { EntityEffectBlueprint } from "@providers/entityEffects/data/types/entityEffectBlueprintTypes";
import { IEquippableMeleeTier14WeaponBlueprint } from "@providers/item/data/types/TierBlueprintTypes";
import {
  CharacterBuffDurationType,
  CharacterBuffType,
  CombatSkill,
  EntityAttackType,
  ItemSlotType,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { SwordsBlueprint } from "../../../types/itemsBlueprintTypes";

export const itemShadowstrikeFalchion: IEquippableMeleeTier14WeaponBlueprint = {
  key: SwordsBlueprint.ShadowstrikeFalchion,
  type: ItemType.Weapon,
  subType: ItemSubType.Sword,
  textureAtlas: "items",
  texturePath: "swords/shadowstrike-falchion.png",
  name: "Shadowstrike Falchion",
  description:
    "Born from the depths of darkness, this falchion strikes swiftly from the shadows, delivering fatal blows before enemies realize their peril.",
  attack: 105,
  defense: 85,
  tier: 14,
  weight: 1.4,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 230,
  entityEffects: [EntityEffectBlueprint.Corruption],
  entityEffectChance: 85,
  equippedBuff: [
    {
      type: CharacterBuffType.Skill,
      trait: CombatSkill.Sword,
      buffPercentage: 10,
      durationType: CharacterBuffDurationType.Permanent,
      options: {
        messages: {
          activation: "You feel the power of the shadowstrike falchion flowing through your body. (+10% sword skill)",
          deactivation: "You feel the power of the shadowstrike falchion leaving your body. (-10% sword skill)",
        },
      },
    },
  ],
  equippedBuffDescription: "Increases sword skill by 10%",
};
