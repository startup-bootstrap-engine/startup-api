import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { UseWithItemToTile } from "@providers/useWith/abstractions/UseWithItemToTile";
import { IUseWithTargetTile } from "@providers/useWith/useWithTypes";
import {
  CraftingSkill,
  IToolItemBlueprint,
  ItemRarities,
  ItemSlotType,
  ItemSubType,
  ItemType,
  RangeTypes,
} from "@rpg-engine/shared";
import { EntityAttackType } from "@rpg-engine/shared/dist/types/entity.types";
import { CraftingResourcesBlueprint, ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemElderHeartAxe: IToolItemBlueprint = {
  key: ToolsBlueprint.ElderHeartAxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.CarpentersAxe,
  textureAtlas: "items",
  texturePath: "tools/elder-heart-axe.png",
  name: "Elder Heart Axe",
  description:
    "A finely crafted tool imbued with elven magic, designed for harvesting the most sacred and ancient of woods.",
  attack: 10,
  defense: 4,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 30000,
  hasUseWith: true,
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
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    await useWithItemToTile.execute(
      character,
      {
        targetTile,
        targetTileAnimationEffectKey: "cutting-wood",
        errorMessages: [
          "This tree is too young for the Elderheart.",
          "The spirits of this forest resist your touch.",
          "You sense this wood holds no ancient power.",
        ],
        successMessages: [
          "The Elderheart sings as it cuts!",
          "You feel a surge of energy from the ancient wood",
          "The tree yields its secrets to you.",
        ],
        rewards: [
          {
            key: CraftingResourcesBlueprint.GreaterWoodenLog,
            qty: [3, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 8, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.WoodenSticks,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 5, rarityOfTool),
          },
          {
            key: CraftingResourcesBlueprint.ElvenWood,
            qty: [2, 3],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Lumberjacking, 12, rarityOfTool),
          },
        ],
      },
      skillIncrease
    );
  },
  usableEffectDescription: "Use on ancient, magically-infused trees to harvest rare and powerful Elderwood.",
};
