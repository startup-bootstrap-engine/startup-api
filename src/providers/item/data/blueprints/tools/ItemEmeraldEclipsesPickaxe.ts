import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { container } from "@providers/inversify/container";
import { ItemCraftable } from "@providers/item/ItemCraftable";
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
import { CraftingResourcesBlueprint, RangedWeaponsBlueprint, ToolsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemEmeraldEclipsesPickaxe: IToolItemBlueprint = {
  key: ToolsBlueprint.EmeraldEclipsesPickaxe,
  type: ItemType.Tool,
  subType: ItemSubType.Tool,
  toolCategory: ToolsBlueprint.Pickaxe,
  textureAtlas: "items",
  texturePath: "tools/emerald-eclipses-pickaxe.png",
  name: "Emerald Eclipses Pickaxe",
  description:
    "Harnessing the power of celestial events, it eclipses corruption while illuminating the brilliance of green ore.",
  attack: 10,
  defense: 4,
  weight: 0.5,
  allowedEquipSlotType: [ItemSlotType.LeftHand, ItemSlotType.RightHand],
  rangeType: EntityAttackType.Melee,
  basePrice: 130,
  hasUseWith: true,
  canSell: false,
  useWithMaxDistanceGrid: RangeTypes.UltraShort,
  useWithTileEffect: async (
    originItem: IItem,
    targetTile: IUseWithTargetTile,
    targetName: string | undefined,
    character: ICharacter,
    itemCraftable: ItemCraftable,
    skillIncrease: SkillIncrease
  ) => {
    const useWithItemToTile = container.get<UseWithItemToTile>(UseWithItemToTile);
    const rarityOfTool = originItem.rarity ?? ItemRarities.Common;

    const baseUseWithItemToTileOptions: IUseWithItemToTileOptions = {
      targetTile,
      targetTileAnimationEffectKey: "mining",
      errorMessages: [
        "The celestial power didn't reveal any ores this time.",
        "Seems like the brilliance of the green ore remains hidden under the eclipse.",
        "No ores illuminated by the celestial event this time.",
      ],
      successMessages: [
        "Your Emerald Eclipses Pickaxe has revealed the brilliance of green ore amidst the celestial event!",
        "Success! The celestial event has illuminated green ore for extraction with your Emerald Eclipses Pickaxe.",
        "You've uncovered the brilliance of green ore under the celestial event with your Emerald Eclipses Pickaxe!",
      ],
      rewards: [
        {
          key: RangedWeaponsBlueprint.Stone,
          qty: [1, 2],
          chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 8, rarityOfTool),
        },
      ],
    };

    let useWithItemToTileOptions: IUseWithItemToTileOptions = baseUseWithItemToTileOptions;

    switch (targetName) {
      case CraftingResourcesBlueprint.GreenOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.GreenOre,
              qty: [2, 3],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 4, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
      case CraftingResourcesBlueprint.CorruptionOre:
        useWithItemToTileOptions = {
          ...baseUseWithItemToTileOptions,
          rewards: [
            ...baseUseWithItemToTileOptions.rewards,
            {
              key: CraftingResourcesBlueprint.CorruptionOre,
              qty: [1, 2],
              chance: await itemCraftable.getCraftChance(character, CraftingSkill.Mining, 2, rarityOfTool),
            },
          ] as IUseWithItemToTileReward[],
        };
        break;
    }

    await useWithItemToTile.execute(character, useWithItemToTileOptions, skillIncrease);
  },
  usableEffectDescription: "Use it on green and corruption ores to mine them",
};