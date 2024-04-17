import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
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
  remainingUses: 60,
  initialRemainingUses: 60,
  textureAtlas: "items",
  texturePath: "tools/watering-can.png",
  animationKey: AnimationEffectKeys.Blue,
  projectileAnimationKey: AnimationEffectKeys.Energy,
  name: "Watering Can",
  description: "A tool used for watering plants. It has 60 charges and can be refilled with water.",
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
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ): Promise<void> => {
    const useWithRefill = container.get<UseWithRefill>(UseWithRefill);

    const options: IUseWithRefill = {
      targetTile,
      originItem,
      successMessages: [
        "You've refilled your watering can! 💦",
        "Watering can is full again! 🚰",
        "Your watering can is ready for action! 💧🛢️",
        "Watering can topped up! 🌊",
        "You've replenished your watering can! 🔄💦",
      ],
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
      successMessages: [
        "You've watered the plant! 💦",
        "Great job, the plant has been watered! 🌱💧",
        "The plant is happy with the water! 🌿💦",
        "You've given the plant a drink! 🍃💧",
        "The plant is soaking up the water! 🌵💦",
        "You've quenched the plant's thirst! 🌻💧",
        "The plant is feeling refreshed! 🌼💦",
        "The plant is enjoying the water! 🌸💧",
        "You've hydrated the plant! 🌴💦",
        "The plant is loving the water! 🌺💧",
        "You've nourished the plant with water! 🌾💦",
        "The plant is thriving with the water! 🍀💧",
        "You've revitalized the plant with water! 🍂💦",
        "The plant is flourishing with the water! 🍁💧",
        "You've invigorated the plant with water! 🌷💦",
      ],
    };

    await useWithRefill.executeUse(character, options, skillIncrease);
  },
  usableEffectDescription: "Use it on plants to water them.",
};
