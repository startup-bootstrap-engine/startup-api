import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { EffectableAttribute, ItemUsableEffect } from "@providers/item/helper/ItemUsableEffect";
import { ItemSubType, ItemType } from "@rpg-engine/shared";
import { FoodsBlueprint } from "../../types/itemsBlueprintTypes";

export const itemBanana: Partial<IItem> = {
  key: FoodsBlueprint.Banana,
  type: ItemType.Consumable,
  subType: ItemSubType.Food,
  textureAtlas: "items",
  texturePath: "foods/banana.png",
  textureKey: "banana",
  name: "Banana",
  description: "A ripe banana.",
  weight: 0.05,
  usableEffect: (character: ICharacter) => {
    ItemUsableEffect.apply(character, EffectableAttribute.Health, 1);
  },
};
