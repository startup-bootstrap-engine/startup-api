/* eslint-disable mongoose-lean/require-lean */
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
  gemEntityEffectChance?: number;
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
      gemEntityEffectChance: gemItemBlueprint.gemEntityEffectChance,
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
    // Fetch the current item stats from the database
    const currentItem = await Item.findById(targetItem._id).lean();

    if (!currentItem) {
      throw new Error(`Item with ID ${targetItem._id} not found`);
    }

    // Use 0 as the default value if attack or defense are undefined
    const currentAttack = currentItem.attack ?? 0;
    const currentDefense = currentItem.defense ?? 0;

    // Calculate new stats
    const newAttack = currentAttack + (gemItemBlueprint.gemStatBuff?.attack || 0);
    const newDefense = currentDefense + (gemItemBlueprint.gemStatBuff?.defense || 0);

    // Update the item in the database
    await Item.findByIdAndUpdate(targetItem._id, {
      $set: {
        attack: isArmorOrShield ? currentAttack : newAttack,
        defense: newDefense,
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
      $set: {
        entityEffectChance: gemItemBlueprint.gemEntityEffectChance,
      },
    });
  }

  private async updateTargetEquippedBuffDescription(
    targetItem: IItem,
    gemItemBlueprint: IItemGem,
    isArmorOrShield: boolean
  ): Promise<void> {
    const currentItem = await Item.findById(targetItem._id).lean();
    if (!currentItem) {
      throw new Error(`Item with ID ${targetItem._id} not found`);
    }

    const attachedGems = currentItem.attachedGems || [];
    let totalAttack = 0;
    let totalDefense = 0;
    const entityEffects: Set<string> = new Set();
    let entityEffectChance = 0;
    const gemNames: Set<string> = new Set();

    for (const gem of attachedGems) {
      totalAttack += gem.gemStatBuff?.attack || 0;
      totalDefense += gem.gemStatBuff?.defense || 0;

      if (!isArmorOrShield) {
        if (gem.gemEntityEffectsAdd) {
          gem.gemEntityEffectsAdd.forEach((effect) => entityEffects.add(effect));
        }
        entityEffectChance = Math.max(entityEffectChance, gem.gemEntityEffectChance || 0);
      }

      gemNames.add(gem.name?.replace(" Gem", "")!);
    }

    const gemNamesArray = Array.from(gemNames);
    let gemDescription = "";

    if (gemNamesArray.length > 0) {
      gemDescription = gemNamesArray.length === 1 ? `${gemNamesArray[0]} Gem: ` : `${gemNamesArray.join(", ")} Gems: `;
    }

    if (isArmorOrShield) {
      gemDescription += `+${totalDefense} def.`;
    } else {
      gemDescription += `+${totalAttack} atk, +${totalDefense} def`;
    }

    if (entityEffects.size > 0) {
      gemDescription += `, ${entityEffectChance}% chance of applying ${Array.from(entityEffects).join(", ")} effects.`;
    }

    // Preserve existing description if it exists
    const existingDescription = currentItem.equippedBuffDescription || "";
    const [baseDescription, existingBuffs] = existingDescription.split(/gems?:|Additional buffs:/);

    let updatedDescription = baseDescription.trim();
    if (gemNamesArray.length > 0) {
      updatedDescription += ` ${gemDescription}`;
    }
    if (existingBuffs) {
      updatedDescription += ` Additional buffs:${existingBuffs}.`;
    } else if (gemItemBlueprint.gemEquippedBuffAdd) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const formatTrait = (trait: string) => {
        return trait
          .split(/(?=[A-Z])/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const buffs = Array.isArray(gemItemBlueprint.gemEquippedBuffAdd)
        ? gemItemBlueprint.gemEquippedBuffAdd
            .map((buff) => `${formatTrait(buff.trait)}: +${buff.buffPercentage}%`)
            .join(", ")
        : `${formatTrait(gemItemBlueprint.gemEquippedBuffAdd.trait)}: +${
            gemItemBlueprint.gemEquippedBuffAdd.buffPercentage
          }%`;

      updatedDescription += ` Additional buffs: ${buffs}.`;
    }

    await Item.findByIdAndUpdate(targetItem._id, {
      $set: {
        equippedBuffDescription: updatedDescription.trim(),
        entityEffects: Array.from(entityEffects),
        entityEffectChance: entityEffectChance,
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

    const isStackableItem = targetItem.stackQty! > 1 || targetItem.maxStackSize > 1;

    if (isStackableItem) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't attach gems to this item.");
      return false;
    }

    const isRangedAmmo = targetItem.subType === ItemSubType.Ranged && !targetItem.maxRange;
    if (isRangedAmmo) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you can't attach gems to this item.");
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
