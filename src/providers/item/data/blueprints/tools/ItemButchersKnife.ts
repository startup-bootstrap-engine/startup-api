import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { CarveMeatFromBody } from "@providers/item/ItemCarveMeatFromBody";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IToolItemBlueprint, ItemSlotType, ItemSubType, ItemType, RangeTypes } from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemButchersKnife: IToolItemBlueprint = {
  key: ToolsBlueprint.ButchersKnife,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  texturePath: "tools/butchers-knife.png",
  name: "Butcher's Knife",
  description: "Use it to butcher a dead body from animals or bids to get meat/",
  attack: 5,
  defense: 2,
  weight: 0.2,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 45,
  hasUseWith: true,
  useWithMaxDistanceGrid: RangeTypes.Short,
  canSell: false,
  usableEffect: async (
    character: ICharacter,
    targetItem: IItem,
    itemCraftable: ItemCraftableQueue | null,
    skillIncrease: SkillIncrease,
    originItem: IItem
  ) => {
    const carveMeatFromBody = container.get<CarveMeatFromBody>(CarveMeatFromBody);

    await carveMeatFromBody.execute(character, targetItem, originItem);
  },

  usableEffectDescription: "Use it to butcher a dead body from animals or bids to get meat.",
};
