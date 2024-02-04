import { recipeBlueprintsIndex } from "@providers/useWith/recipes";
import { IUseWithCraftingRecipe } from "@providers/useWith/useWithTypes";
import { CraftingSkill, ItemType } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CraftingSkillsMap } from "./constants";

@provide(SkillCraftingMapper)
export class SkillCraftingMapper {
  public getCraftingSkillToUpdate(itemKey: string): string | undefined {
    let skillToUpdate;

    if (itemKey === ItemType.Plant) {
      return CraftingSkill.Farming;
    }

    if (CraftingSkillsMap.has(itemKey)) {
      return CraftingSkillsMap.get(itemKey) ?? CraftingSkill.Blacksmithing;
    }

    if (recipeBlueprintsIndex[itemKey]) {
      const itemBlueprint = recipeBlueprintsIndex[itemKey][0] as IUseWithCraftingRecipe;

      if (itemBlueprint && itemBlueprint.minCraftingRequirements[0]) {
        return itemBlueprint.minCraftingRequirements[0];
      }
    }

    return skillToUpdate;
  }
}
