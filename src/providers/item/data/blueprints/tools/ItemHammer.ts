import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import {
  IUseWithItemToTileOptions,
  IUseWithItemToTileReward,
  UseWithItemToTile,
} from "@providers/useWith/abstractions/UseWithItemToTile";
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

export const itemHammer: IToolItemBlueprint = {
  key: ToolsBlueprint.Hammer,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  textureAtlas: "items",
  texturePath: "hammers/hammer.png",
  name: "Blacksmith's Hammer",
  description: "Use with an anvil with some ore in your inventory to forge an ingot.",
  attack: 5,
  defense: 2,
  weight: 0.1,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 60,
  hasUseWith: true,
  canSell: false,
  useWithMaxDistanceGrid: RangeTypes.UltraShort,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftableQueue,
    skillIncrease: SkillIncrease
  ) => {
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    const rewards = new Map<string, IUseWithItemToTileReward[]>([
      [
        CraftingResourcesBlueprint.IronOre,
        [
          {
            key: CraftingResourcesBlueprint.IronIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 65, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.CopperOre,
        [
          {
            key: CraftingResourcesBlueprint.CopperIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 60, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.SilverOre,
        [
          {
            key: CraftingResourcesBlueprint.SilverIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 55, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.GoldenOre,
        [
          {
            key: CraftingResourcesBlueprint.GoldenIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 50, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.GreenOre,
        [
          {
            key: CraftingResourcesBlueprint.GreenIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 45, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.ObsidiumOre,
        [
          {
            key: CraftingResourcesBlueprint.ObsidiumIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 45, rarityOfTool),
          },
        ],
      ],
      [
        CraftingResourcesBlueprint.CorruptionOre,
        [
          {
            key: CraftingResourcesBlueprint.CorruptionIngot,
            qty: [2, 4],
            chance: await itemCraftable.getCraftChance(character, CraftingSkill.Blacksmithing, 45, rarityOfTool),
          },
        ],
      ],
    ]);
    const options: IUseWithItemToTileOptions = {
      targetTile,
      requiredResource: {
        key: [
          CraftingResourcesBlueprint.IronOre,
          CraftingResourcesBlueprint.CopperOre,
          CraftingResourcesBlueprint.GoldenOre,
          CraftingResourcesBlueprint.SilverOre,
          CraftingResourcesBlueprint.GreenOre,
          CraftingResourcesBlueprint.CorruptionOre,
          CraftingResourcesBlueprint.ObsidiumOre,
        ],
        decrementQty: 5,
        errorMessage: "Sorry, you need some more ore to forge an ingot.",
      },
      targetTileAnimationEffectKey: "block",
      errorMessages: [
        "Hmm... you failed!",
        "You effort is in vain.",
        "You can't do anything here with that.",
        "The business of a blacksmith is hard work! Nothing here!",
      ],
      successMessages: ["You forged some ingots!", "Wow! You got some ingots!"],
      rewards,
    };

    await useWithItemToTile.execute(character, options, skillIncrease);
  },
  usableEffectDescription: "Use it on an anvil with ore to forge an ingot",
};
