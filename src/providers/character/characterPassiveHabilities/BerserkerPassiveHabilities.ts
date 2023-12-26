import { Character } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { ItemEquipValidator } from "@providers/item/ItemPickup/ItemEquipValidator";
import { CharacterClass, ICharacter } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";

@provide(BerserkerPassiveHabilities)
export class BerserkerPassiveHabilities {
  constructor(private itemEquipValidator: ItemEquipValidator) {}

  @TrackNewRelicTransaction()
  public async canBerserkerEquipItem(characterId: Types.ObjectId, itemId: Types.ObjectId): Promise<boolean> {
    const character = (await Character.findById(characterId).lean()) as ICharacter;

    if (character.class !== CharacterClass.Berserker) {
      return false;
    }

    const canEquip = await this.itemEquipValidator.canEquipItem(characterId, itemId);

    return canEquip;
  }
}
