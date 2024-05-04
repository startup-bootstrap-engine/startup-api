import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { AnimationEffect } from "@providers/animation/AnimationEffect";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { blueprintManager } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  AnimationEffectKeys,
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemGem,
  ItemSocketEvents,
  ItemSubType,
  ItemType,
} from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { clearCacheForKey } from "speedgoose";

export interface IAttachedItemGem {
  key: string;
  name: string;
  gemStatBuff?: {
    attack?: number;
    defense?: number;
  };
  gemEntityEffectsAdd?: string[];
}

@provide(GemAttachToEquip)
export class GemAttachToEquip {
  constructor(
    private characterValidation: CharacterValidation,
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private animationEffect: AnimationEffect,
    private characterInventory: CharacterInventory,
    private characterItemSlots: CharacterItemSlots
  ) {}

  public async attachGemToEquip(originItem: IItem, targetItem: IItem, character: ICharacter): Promise<boolean> {
    const gemItemBlueprint = await blueprintManager.getBlueprint<IItemGem>("items", originItem.key);

    await clearCacheForKey(`${character._id}-inventory`);

    const isValid = this.isValid(gemItemBlueprint, originItem, targetItem, character);

    if (!isValid) {
      return false;
    }

    const wasGemConsumed = await this.characterItemInventory.deleteItemFromInventory(originItem._id, character);

    if (!wasGemConsumed) {
      return false;
    }

    const wasTargetItemUpdatedWithGemMetadata = await this.updateTargetItemAttachedGemsArray(
      targetItem,
      gemItemBlueprint
    );

    if (!wasTargetItemUpdatedWithGemMetadata) {
      return false;
    }

    const isArmorOrShield = targetItem.type === ItemType.Armor || targetItem.subType === ItemSubType.Shield;

    if (gemItemBlueprint.gemStatBuff) {
      await this.attachGemStatBuffToEquip(gemItemBlueprint, targetItem, isArmorOrShield);
    }

    if (gemItemBlueprint.gemEntityEffectsAdd && !isArmorOrShield) {
      await this.attachGemEntityEffectsToEquip(gemItemBlueprint, targetItem);
    }

    if (gemItemBlueprint.gemEntityEffectsAdd && gemItemBlueprint.gemEntityEffectsAdd.length > 0) {
      await this.updateTargetEquippedBuffDescription(targetItem, gemItemBlueprint, isArmorOrShield);
    }

    // refresh item state
    targetItem = (await Item.findById(targetItem._id).lean()) as IItem;

    await this.characterWeight.updateCharacterWeight(character);
    await this.refreshInventoryAndItem(character, targetItem);

    await this.animationEffect.sendAnimationEventToCharacter(character, AnimationEffectKeys.LevelUp);

    this.sendSuccessMessage(character, gemItemBlueprint, originItem, targetItem, isArmorOrShield);

    // delete database gem representation
    await Item.findByIdAndDelete(originItem._id);

    return true;
  }

  private async refreshInventoryAndItem(character: ICharacter, targetItem: IItem): Promise<void> {
    const inventory = await this.characterInventory.getInventory(character);
    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    const targetItemSlots = await this.characterItemSlots.findItemSlotIndex(inventoryContainer as any, targetItem._id);
    if (targetItemSlots) {
      await this.characterItemSlots.updateItemOnSlot(targetItemSlots, inventoryContainer as any, targetItem);
    }

    const payloadUpdate: IEquipmentAndInventoryUpdatePayload = {
      inventory: inventoryContainer,
      openEquipmentSetOnUpdate: false,
      openInventoryOnUpdate: true,
    };

    this.socketMessaging.sendEventToUser<IEquipmentAndInventoryUpdatePayload>(
      character.channelId!,
      ItemSocketEvents.EquipmentAndInventoryUpdate,
      payloadUpdate
    );
  }

  private async updateTargetItemAttachedGemsArray(targetItem: IItem, gemItemBlueprint: IItemGem): Promise<boolean> {
    const attachedGemPayload: IAttachedItemGem = {
      key: gemItemBlueprint.key,
      name: gemItemBlueprint.name,
      gemStatBuff: gemItemBlueprint.gemStatBuff,
      gemEntityEffectsAdd: gemItemBlueprint.gemEntityEffectsAdd,
    };

    const updated = await Item.findByIdAndUpdate(targetItem._id, {
      $addToSet: {
        attachedGems: attachedGemPayload,
      },
    });

    return !!updated;
  }

  private sendSuccessMessage(
    character: ICharacter,
    gemItemBlueprint: IItemGem,
    originItem: IItem,
    targetItem: IItem,
    isArmorOrShield: boolean
  ): void {
    let message = `Attached '${originItem.name}' to ${targetItem.name}.`;

    if (gemItemBlueprint.gemStatBuff) {
      const { attack = 0, defense = 0 } = gemItemBlueprint.gemStatBuff;

      if (isArmorOrShield) {
        if (defense > 0) {
          message += ` Increased defense by: +${defense}.`;
        }
      } else {
        const statIncreases: string[] = [];
        if (attack > 0) statIncreases.push(`+${attack} attack`);
        if (defense > 0) statIncreases.push(`+${defense} defense`);
        if (statIncreases.length > 0) {
          message += ` Increased stats by: ${statIncreases.join(", ")}.`;
        }
      }
    }

    if (gemItemBlueprint.gemEntityEffectsAdd && gemItemBlueprint.gemEntityEffectsAdd.length > 0 && !isArmorOrShield) {
      message += ` Added effects: ${gemItemBlueprint.gemEntityEffectsAdd.join(", ")}.`;
    }

    this.socketMessaging.sendMessageToCharacter(character, message);
  }

  private async attachGemStatBuffToEquip(
    gemItemBlueprint: IItemGem,
    targetItem: IItem,
    isArmorOrShield: boolean
  ): Promise<void> {
    if (isArmorOrShield) {
      // increase defense only
      await Item.findByIdAndUpdate(targetItem._id, {
        $inc: {
          defense: gemItemBlueprint.gemStatBuff?.defense,
        },
      });
      return;
    }

    // else, if its a weapon, increase both attack and defense

    await Item.findByIdAndUpdate(targetItem._id, {
      $inc: {
        attack: gemItemBlueprint.gemStatBuff?.attack,
        defense: gemItemBlueprint.gemStatBuff?.defense,
      },
    });
  }

  private async attachGemEntityEffectsToEquip(gemItemBlueprint: IItemGem, targetItem: IItem): Promise<void> {
    await Item.findByIdAndUpdate(targetItem._id, {
      $addToSet: {
        entityEffects: {
          $each: gemItemBlueprint.gemEntityEffectsAdd,
        },
      },
    });
  }

  private async updateTargetEquippedBuffDescription(
    targetItem: IItem,
    gemItemBlueprint: IItemGem,
    isArmorOrShield: boolean
  ): Promise<void> {
    let updatedMessage = `${gemItemBlueprint.name}: +${gemItemBlueprint.gemStatBuff?.attack || 0} atk, +${
      gemItemBlueprint.gemStatBuff?.defense || 0
    } def, ${gemItemBlueprint.gemEntityEffectChance || 0}% chance to apply ${
      gemItemBlueprint.gemEntityEffectsAdd?.join(", ") || ""
    } effects.`;

    if (gemItemBlueprint.gemEquippedBuffAdd) {
      const buffs = Array.isArray(gemItemBlueprint.gemEquippedBuffAdd)
        ? gemItemBlueprint.gemEquippedBuffAdd
        : [gemItemBlueprint.gemEquippedBuffAdd];
      const buffsDescriptions = buffs.map((buff) => `${buff.trait}: +${buff.buffPercentage}%`);
      updatedMessage += ` Additional buffs: ${buffsDescriptions.join(", ")}.`;
    }

    if (isArmorOrShield) {
      updatedMessage = `${gemItemBlueprint.name}: +${gemItemBlueprint.gemStatBuff?.defense || 0} def.`;
      if (gemItemBlueprint.gemEquippedBuffAdd) {
        const buffs = Array.isArray(gemItemBlueprint.gemEquippedBuffAdd)
          ? gemItemBlueprint.gemEquippedBuffAdd
          : [gemItemBlueprint.gemEquippedBuffAdd];
        const buffsDescriptions = buffs.map((buff) => `${buff.trait}: +${buff.buffPercentage}%`);
        updatedMessage += ` Additional buffs: ${buffsDescriptions.join(", ")}.`;
      }
    }

    const newDescription = (targetItem.equippedBuffDescription || "") + " " + updatedMessage;

    await Item.findByIdAndUpdate(targetItem._id, {
      $set: {
        equippedBuffDescription: newDescription,
      },
    });
  }

  private isValid(gemItemBlueprint: IItemGem, originItem: IItem, targetItem: IItem, character: ICharacter): boolean {
    const isCharacterValid = this.characterValidation.hasBasicValidation(character);

    if (!isCharacterValid) {
      return false;
    }

    if (gemItemBlueprint.subType !== ItemSubType.Gem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can only attach gems to equipment.");
      return false;
    }

    if (
      targetItem.type !== ItemType.Weapon &&
      targetItem.type !== ItemType.Armor &&
      targetItem.subType !== ItemSubType.Shield
    ) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        "Sorry,  you can only attach gems to weapons, armors, and shields."
      );
      return false;
    }

    const doesCharacterOwnsGemItem = String(originItem.owner) === String(character._id);
    const doesCharacterOwnsTargetItem = String(targetItem.owner) === String(character._id);

    if (!doesCharacterOwnsGemItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't own this gem.");
      return false;
    }

    if (!doesCharacterOwnsTargetItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you don't own this equipment.");
      return false;
    }

    const attachedGems = targetItem.attachedGems ?? [];

    if (attachedGems.some((gem) => gem.key === originItem.key)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you already have this gem equipped.");
      return false;
    }

    const tier = targetItem.tier ?? 0;
    const maxGems = this.getMaxGemsForTier(tier);
    if (attachedGems.length >= maxGems) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Sorry, you can only attach up to ${maxGems} gems to tier ${tier} items.`
      );
      return false;
    }

    return true;
  }

  private getMaxGemsForTier(tier: number): number {
    switch (true) {
      case tier <= 4:
        return 1;
      case tier <= 9:
        return 2;
      case tier <= 14:
        return 3;
      default:
        return 4;
    }
  }
}
