import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { ITEM_USE_WITH_BASE_EFFECT, ITEM_USE_WITH_BASE_SCALING_FACTOR } from "@providers/constants/ItemConstants";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { IMagicItemUseWithEntity } from "@providers/useWith/useWithTypes";
import { ISkill, IUseWithItem, IUseWithTile } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";

@provide(UseWithHelper)
export class UseWithHelper {
  constructor(private characterValidation: CharacterValidation, private characterItems: CharacterItems) {}

  public basicValidations(character: ICharacter, data: IUseWithItem | IUseWithTile): boolean {
    if (!this.characterValidation.hasBasicValidation(character)) {
      return false;
    }
    if (!data.originItemId) {
      console.error(`UseWith > Field 'originItemId' is missing! data: ${JSON.stringify(data)}`);
      return false;
    }
    return true;
  }

  public async getItem(character: ICharacter, itemId: string): Promise<IItem> {
    const item = (await Item.findOne({ _id: itemId, owner: character._id }).lean({
      virtuals: true,
      defaults: true,
    })) as IItem;

    if (!item) {
      throw new Error(`UseWith > Item with id ${itemId} does not belong to the character or does not exist!`);
    }

    return item;
  }
}

export async function calculateItemUseEffectPoints(itemKey: string, caster: ICharacter): Promise<number> {
  const updatedCharacter = (await Character.findOne({ _id: caster._id }).lean({
    virtuals: true,
    defaults: true,
  })) as unknown as ICharacter;

  const skills = (await Skill.findById(updatedCharacter.skills)
    .lean({
      virtuals: true,
      defaults: true,
    })
    .cacheQuery({
      cacheKey: `${updatedCharacter._id}-skills`,
    })) as unknown as ISkill;

  updatedCharacter.skills = skills;

  const magicLevel = skills.magic?.level ?? 0;

  const itemData = await blueprintManager.getBlueprint<IMagicItemUseWithEntity>(
    "items",
    itemKey as AvailableBlueprints
  );

  if (!itemData || !itemData.power) {
    throw new Error(`Item ${itemKey} does not have a valid power property`);
  }

  const minPoints = itemData.power;
  const scalingFactor = ITEM_USE_WITH_BASE_EFFECT + magicLevel * ITEM_USE_WITH_BASE_SCALING_FACTOR;
  const meanPoints = Math.round(minPoints + magicLevel * scalingFactor);

  const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

  const sigmoidRandom = (min: number, max: number): number => {
    const range = 0.25;
    const x = Math.random() * range - range / 2;
    return min + sigmoid(x) * (max - min);
  };

  const effectPoints = Math.round(sigmoidRandom(minPoints, meanPoints));

  return Math.min(Math.max(minPoints, effectPoints), meanPoints);
}
