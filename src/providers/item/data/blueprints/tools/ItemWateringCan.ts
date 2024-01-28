import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithRefill, UseWithRefill } from "@providers/useWith/abstractions/UseWithRefill";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import {
  AnimationEffectKeys,
  EntityAttackType,
  IRefillableItem,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemWateringCan: IRefillableItem = {
  key: ToolsBlueprint.WateringCan,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  isRefillable: true,
  refillResourceKey: "water",
  remainingUses: 10,
  initialRemainingUses: 10,
  textureAtlas: "items",
  texturePath: "tools/watering-can.png",
  animationKey: AnimationEffectKeys.Blue,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  name: "Watering Can",
  description: "A tool used for watering plants.",
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  hasUseWith: true,
  basePrice: 60,
  rangeType: EntityAttackType.None,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: false,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string,
    character: ICharacter,
    itemCraftable: ItemCraftable,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    const useWithRefill = container.get<UseWithRefill>(UseWithRefill);

    const options: IUseWithRefill = {
      targetTile,
      originItem,
      errorMessages: ["Sorry, you can't refill this time"],
      successMessages: ["You've refilled your watering can"],
    };

    await useWithRefill.executeRefill(character, options, skillIncrease);
  },
  usableEffect: async (
    character: ICharacter,
    targetItem: IItem,
    skillIncrease: SkillIncrease,
    originItem: IItem
  ): Promise<void> => {
    const useWithRefill = container.get<UseWithRefill>(UseWithRefill);

    const options: IUseWithRefill = {
      targetItem,
      originItem,
      decrementQty: 1,
      targetType: ItemType.Plant,
      errorMessages: ["Sorry, You can't water now"],
      successMessages: ["You've watered the plant"],
    };

    await useWithRefill.executeUse(character, options, skillIncrease);
  },
  usableEffectDescription: "Use it on plants to water them",
};
