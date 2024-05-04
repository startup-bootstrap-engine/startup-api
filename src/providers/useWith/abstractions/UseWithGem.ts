import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { CharacterItemSlots } from "@providers/character/characterItems/CharacterItemSlots";
import { CharacterWeightQueue } from "@providers/character/weight/CharacterWeightQueue";
import { container } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import {
  IEquipmentAndInventoryUpdatePayload,
  IItemContainer,
  IItemGem,
  ItemSocketEvents,
  ItemType,
} from "@rpg-engine/shared";

import { provide } from "inversify-binding-decorators";

interface IGemStatBuff {
  attack?: number;
  defense?: number;
}

@provide(UseWithGem)
export class UseWithGem {
  constructor(
    private socketMessaging: SocketMessaging,
    private characterItemInventory: CharacterItemInventory,
    private characterWeight: CharacterWeightQueue,
    private characterInventory: CharacterInventory,
    private characterItemSlots: CharacterItemSlots
  ) {}

  public async execute(originItem: IItem, targetItem: IItem, character: ICharacter): Promise<void> {
    if (targetItem.type !== ItemType.Weapon) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, only weapons can be used with gems.");
      return;
    }

    const attachedGems = targetItem.attachedGems ?? [];
    if (attachedGems.some((gem) => gem.key === originItem.key)) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, you already have this gem equipped.");
      return;
    }

    const tier = targetItem.tier ?? 0;
    const maxGems = this.getMaxGemsForTier(tier);
    if (attachedGems.length >= maxGems) {
      this.socketMessaging.sendErrorMessageToCharacter(
        character,
        `Sorry, you can only have ${maxGems} gem(s) equipped.`
      );
      return;
    }

    const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

    const originItemBlueprint = (await blueprintManager.getBlueprint("items", originItem.key)) as IItemGem;

    if (!originItemBlueprint) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, failed to fetch origin item blueprint.");
      return;
    }

    const gemStatBuff = originItemBlueprint.gemStatBuff;
    const gemEntityEffectsAdd = originItemBlueprint.gemEntityEffectsAdd;

    this.updateItemStats(targetItem, gemStatBuff);
    this.updateItemEntityEffects(targetItem, gemEntityEffectsAdd);

    const gemEntityEffectChance = originItemBlueprint.gemEntityEffectChance;
    if (gemEntityEffectChance) {
      targetItem.entityEffectChance = Math.max(targetItem.entityEffectChance ?? 0, gemEntityEffectChance);
    }

    const attachedGem = this.createAttachedGem(originItem, gemStatBuff, gemEntityEffectsAdd);
    targetItem.attachedGems = [...attachedGems, attachedGem] as any;

    if (originItemBlueprint.equippedBuffDescription) {
      targetItem.equippedBuffDescription = originItemBlueprint.equippedBuffDescription;
    }

    const updateTarget = await Item.findByIdAndUpdate(targetItem._id, targetItem);

    if (updateTarget) {
      await this.characterItemInventory.decrementItemFromInventoryByKey(originItem.key, character, 1);
      await this.characterWeight.updateCharacterWeight(character);
      await this.refreshInventoryAndItem(character, targetItem);

      this.socketMessaging.sendMessageToCharacter(character, `You equipped ${originItem.name} to ${targetItem.name}.`);
    } else {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, failed to attach gem to item.");
    }
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

  private updateItemStats(item: IItem, gemStatBuff: IGemStatBuff | undefined): void {
    if (gemStatBuff) {
      item.attack = (item.attack ?? 0) + (gemStatBuff.attack ?? 0);
      item.defense = (item.defense ?? 0) + (gemStatBuff.defense ?? 0);
    }
  }

  private updateItemEntityEffects(item: IItem, gemEntityEffectsAdd: string[] | undefined): void {
    if (gemEntityEffectsAdd) {
      const entityEffect = item.entityEffects ?? [];
      const newEffectsToAdd = gemEntityEffectsAdd.filter((effect) => !entityEffect.includes(effect));
      item.entityEffects = [...entityEffect, ...newEffectsToAdd];
    }
  }

  private createAttachedGem(
    originItem: IItem,
    gemStatBuff: IGemStatBuff | undefined,
    gemEntityEffectsAdd: string[] | undefined
  ): any {
    return {
      key: originItem.key,
      name: originItem.name,
      gemStatBuff: {
        attack: gemStatBuff?.attack,
        defense: gemStatBuff?.defense,
      },
      gemEntityEffectsAdd,
    };
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
}
