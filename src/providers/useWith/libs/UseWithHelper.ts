import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { ITEM_USE_WITH_ENTITY_MAX_LEVEL_SUPPORT } from "@providers/constants/ItemConstants";
import { itemsBlueprintIndex } from "@providers/item/data/index";
import { IMagicItemUseWithEntity } from "@providers/useWith/useWithTypes";
import { ISkill, IUseWithItem, IUseWithTile } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(UseWithHelper)
export class UseWithHelper {
  constructor(private characterValidation: CharacterValidation, private characterItems: CharacterItems) {}

  public basicValidations(character: ICharacter, data: IUseWithItem | IUseWithTile): void {
    const isValid = this.characterValidation.hasBasicValidation(character);
    if (!isValid) {
      throw new Error(`UseWith > Character does not fulfill basic validations! Character id: ${character.id}`);
    }

    if (!data.originItemId) {
      throw new Error(`UseWith > Field 'originItemId' is missing! data: ${JSON.stringify(data)}`);
    }
  }

  public async getItem(character: ICharacter, itemId: string): Promise<IItem> {
    const hasItem = await this.characterItems.hasItem(itemId, character, "both");
    if (!hasItem) {
      throw new Error("UseWith > Character does not own the item that wants to use");
    }

    // Check if the item corresponds to the useWithKey
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error(`UseWith > Item with id ${itemId} does not exist!`);
    }
    return item;
  }
}

export const MAX_USE_EFFECT_POINTS = 100;

export async function calculateItemUseEffectPoints(itemKey: string, caster: ICharacter): Promise<number> {
  const updatedCharacter = (await Character.findOne({ _id: caster._id }).populate("skills")) as unknown as ICharacter;
  const level = (updatedCharacter.skills as unknown as ISkill)?.magic?.level ?? 0;

  const itemData = itemsBlueprintIndex[itemKey] as IMagicItemUseWithEntity;

  if (!itemData.power) {
    throw new Error(`Item ${itemKey} does not have a power property`);
  }

  const minPoints = itemData.power ?? 0;

  return minPoints + Math.floor((level / ITEM_USE_WITH_ENTITY_MAX_LEVEL_SUPPORT) * (MAX_USE_EFFECT_POINTS - minPoints));
}