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
    const hasItem = await Item.exists({ _id: itemId, owner: character._id });

    if (!hasItem) {
      throw new Error(`UseWith > Item with id ${itemId} does not belong to the character!`);
    }

    // Check if the item corresponds to the useWithKey
    const item = (await Item.findById(itemId).lean({
      virtuals: true,
      defaults: true,
    })) as unknown as IItem;
    if (!item) {
      throw new Error(`UseWith > Item with id ${itemId} does not exist!`);
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

  const magicLevel = (updatedCharacter.skills as unknown as ISkill)?.magic?.level ?? 0;

  const itemData = await blueprintManager.getBlueprint<IMagicItemUseWithEntity>(
    "items",
    itemKey as AvailableBlueprints
  );

  if (!itemData.power) {
    throw new Error(`Item ${itemKey} does not have a power property`);
  }

  const minPoints = itemData.power ?? 1;
  const scalingFactor = ITEM_USE_WITH_BASE_EFFECT + magicLevel * ITEM_USE_WITH_BASE_SCALING_FACTOR;
  const meanPoints = Math.round(minPoints + magicLevel * scalingFactor);

  // Sigmoid function
  const sigmoid = (x: number): number => {
    return 1 / (1 + Math.exp(-x));
  };

  // Function to generate a sigmoid-based value
  const sigmoidRandom = (min: number, max: number): number => {
    // Reduced range for x to decrease the spread
    const range = 0.25; // You can adjust this value to control the spread
    const x = Math.random() * range - range / 2;
    // Adjust the sigmoid output to the range [min, max]
    return min + sigmoid(x) * (max - min);
  };

  const maxPoints = meanPoints; // Optionally adjust this to further limit the spread
  let effectPoints = sigmoidRandom(minPoints, maxPoints);

  // Ensure effect points are within the specified range
  effectPoints = Math.max(minPoints, effectPoints);
  effectPoints = Math.min(effectPoints, maxPoints);

  return Math.round(effectPoints);
}
