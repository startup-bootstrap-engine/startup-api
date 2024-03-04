import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithRemove, UseWithItemToRemove } from "@providers/useWith/abstractions/UseWithItemToRemove";
import {
  AnimationEffectKeys,
  EntityAttackType,
  IToolItemBlueprint,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemScythe: IToolItemBlueprint = {
  key: ToolsBlueprint.Scythe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  texturePath: "tools/scythe.png",
  name: "Scythe",
  description: "A tool primarily used for cutting grass or reaping crops.",
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  hasUseWith: true,
  basePrice: 80,
  rangeType: EntityAttackType.Melee,
  useWithMaxDistanceGrid: RangeTypes.Medium,
  canSell: false,

  usableEffect: async (
    character: ICharacter,
    targetItem: IItem,
    itemCraftable: IItem,
    skillIncrease: SkillIncrease,
    originItem: IItem
  ): Promise<void> => {
    const useWithItemToRemove = container.get<UseWithItemToRemove>(UseWithItemToRemove);

    const options: IUseWithRemove = {
      targetItem,
      originItem,
      successAnimationEffectKey: AnimationEffectKeys.Rooted,
      errorMessages: ["Sorry, removal is not possible at the moment. Please try again"],
      successMessages: ["Removal has been completed successfully."],
    };

    await useWithItemToRemove.executeUse(character, options, skillIncrease);
  },
  usableEffectDescription: "Use it on grass or crops to cut them",
};
