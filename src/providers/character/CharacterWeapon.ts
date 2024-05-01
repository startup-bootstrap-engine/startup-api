import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { EntityAttackType, ItemSlotType, ItemSubType, ItemType, SKILLS_MAP } from "@rpg-engine/shared";

import { provide } from "inversify-binding-decorators";

export interface ICharacterWeaponResult {
  item: IItem;
  location: ItemSlotType;
}

@provide(CharacterWeapon)
export class CharacterWeapon {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  @TrackNewRelicTransaction()
  public async getWeapon(character: ICharacter): Promise<ICharacterWeaponResult | undefined> {
    const namespace = "character-weapon";
    const cachedResult = (await this.inMemoryHashTable.get(namespace, character._id)) as ICharacterWeaponResult;

    if (cachedResult) {
      return cachedResult;
    }

    const equipment = (await Equipment.findById(character.equipment)
      .lean()
      .cacheQuery({
        cacheKey: `${character._id}-equipment`,
      })) as IEquipment;

    if (!equipment) {
      return undefined;
    }

    const handItems = [
      { hand: "rightHand", slot: ItemSlotType.RightHand },
      { hand: "leftHand", slot: ItemSlotType.LeftHand },
    ];

    for (const { hand, slot } of handItems) {
      const handItem = equipment[hand]
        ? ((await Item.findById(equipment[hand]).lean({ virtuals: true, defaults: true })) as IItem)
        : undefined;

      if (handItem?.type === ItemType.Weapon && handItem?.subType !== ItemSubType.Shield) {
        const result = { item: handItem, location: slot };
        await this.inMemoryHashTable.set(namespace, character._id, result);
        return result;
      }
    }
  }

  @TrackNewRelicTransaction()
  public async hasShield(character: ICharacter): Promise<{ leftHandItem?: IItem; rightHandItem?: IItem } | undefined> {
    const cachedResult = (await this.inMemoryHashTable.get("character-shield", character._id)) as {
      leftHandItem?: IItem;
      rightHandItem?: IItem;
    };

    if (cachedResult) {
      return cachedResult;
    }

    const equipment = await this.getCharacterEquipment(character);
    if (!equipment) return undefined;

    const shieldItems = await this.getShieldItems(equipment);
    if (shieldItems) {
      await this.inMemoryHashTable.set("character-shield", character._id, shieldItems);
      return shieldItems;
    }

    return undefined;
  }

  private async getCharacterEquipment(character: ICharacter): Promise<IEquipment | undefined> {
    return (await Equipment.findById(character.equipment)
      .lean()
      .cacheQuery({ cacheKey: `${character._id}-equipment` })) as IEquipment;
  }

  private async getShieldItems(
    equipment: IEquipment
  ): Promise<{ leftHandItem?: IItem; rightHandItem?: IItem } | undefined> {
    const itemSlots = { leftHand: "leftHand", rightHand: "rightHand" };
    const shieldItems: { leftHandItem?: IItem; rightHandItem?: IItem } = {};

    for (const [key, value] of Object.entries(itemSlots)) {
      const itemId = equipment[value];
      if (itemId) {
        const item = (await Item.findById(itemId).lean({ virtuals: true, defaults: true })) as IItem;
        if (item && item.subType === ItemSubType.Shield) {
          shieldItems[key + "Item"] = item; // Concatenate "Item" to match the key structure in result
        }
      }
    }

    return Object.keys(shieldItems).length > 0 ? shieldItems : undefined;
  }

  @TrackNewRelicTransaction()
  public async getAttackType(character: ICharacter): Promise<EntityAttackType | undefined> {
    const weapon = await this.getWeapon(character);

    if (!weapon || !weapon.item) {
      return EntityAttackType.Melee;
    }

    const rangeType = weapon?.item.rangeType as unknown as EntityAttackType;

    return rangeType;
  }

  //! There's no need to track this transaction because it causes a bug and its already being tracked on getWeapon
  public async getSkillNameByWeapon(character: ICharacter): Promise<string | undefined> {
    const weapon = await this.getWeapon(character);

    if (!weapon) {
      return;
    }

    const weaponSubType = weapon?.item ? weapon?.item.subType || "None" : "None";
    const skillName = SKILLS_MAP.get(weaponSubType);

    if (!skillName) {
      console.error("Failed to get skill name for ", weapon, "for character", character);
      return;
    }

    return skillName;
  }
}
