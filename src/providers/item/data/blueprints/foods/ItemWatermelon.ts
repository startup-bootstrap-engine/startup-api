import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemWatermelon: Partial<IItem> = {
  key: FoodsBlueprint.Watermelon,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/watermelon.png",
  name: "Watermelon",
  description: "A fruit that can be found in tropical areas.",
  weight: 0.5,
  maxStackSize: 100,
  basePrice: 5,
  usableEffect: (character: ICharacter) => {
    ItemUsableEffect.applyEatingEffect(character, 1);
  },
};
