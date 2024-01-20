import { CharacterClass, ItemSubType } from "@rpg-engine/shared";

export const CHARACTER_CLASS_DUAL_YIELD_LIST = {
  [CharacterClass.Warrior]: [[ItemSubType.Sword, ItemSubType.Sword]],
  [CharacterClass.Rogue]: [[ItemSubType.Dagger, ItemSubType.Dagger]],
  [CharacterClass.Berserker]: [
    [ItemSubType.Axe, ItemSubType.Axe],
    [ItemSubType.Sword, ItemSubType.Axe],
    [ItemSubType.Axe, ItemSubType.Sword],
    [ItemSubType.Sword, ItemSubType.Sword],
  ],
};
