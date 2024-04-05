import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { ItemCraftableQueue } from "@providers/item/ItemCraftableQueue";
import { itemsBlueprintIndex } from "@providers/item/data";
import { seedToPlantMapping } from "@providers/plant/data/PlantSeedMap";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketAuth } from "@providers/sockets/SocketAuth";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { SocketChannel } from "@providers/sockets/SocketsTypes";
import { IUseWithSeed, UseWithSocketEvents } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { UseWithHelper } from "../libs/UseWithHelper";
import { IItemUseWith, IUseWithSeedEffect, IUseWithSeedValidationResponse, IUseWithTargetSeed } from "../useWithTypes";
@provide(UseWithSeed)
export class UseWithSeed {
  constructor(
    private socketAuth: SocketAuth,
    private socketMessaging: SocketMessaging,
    private useWithHelper: UseWithHelper,
    private itemCraftable: ItemCraftableQueue,
    private skillIncrease: SkillIncrease,
    private characterItemInventory: CharacterItemInventory
  ) {}

  public onUseWithSeed(channel: SocketChannel): void {
    this.socketAuth.authCharacterOn(
      channel,
      UseWithSocketEvents.UseWithSeed,
      async (useWithSeedData: IUseWithSeed, character) => {
        try {
          const validateData = await this.validateData(character, useWithSeedData);

          if (validateData) {
            const { itemKey, targetSeed, plantKey, useWithTileEffect } = validateData;

            await useWithTileEffect!(itemKey, targetSeed, plantKey, character, this.itemCraftable, this.skillIncrease);
          }
        } catch (error) {
          console.error(error);
        }
      }
    );
  }

  private async validateData(
    character: ICharacter,
    data: IUseWithSeed
  ): Promise<IUseWithSeedValidationResponse | undefined> {
    const { map, isFertileGround, coordinates, itemKey, isEntity } = data;
    const hasSeed = await this.characterItemInventory.checkItemInInventoryByKey(itemKey, character);

    if (!hasSeed) {
      this.socketMessaging.sendErrorMessageToCharacter(character, `Sorry, You don't have any ${itemKey} to use.`);
      return;
    }

    if (!isFertileGround || isEntity) {
      this.socketMessaging.sendErrorMessageToCharacter(character, "Sorry, You can't seeds here.");
      return;
    }

    const itemBlueprint = itemsBlueprintIndex[itemKey] as Partial<IItemUseWith>;
    const useWithTileEffect = itemBlueprint.useWithTileEffect as unknown as IUseWithSeedEffect;

    if (!useWithTileEffect) {
      this.socketMessaging.sendErrorMessageToCharacter(character, `Item '${itemKey}' cannot be used with Seed...`);
      return;
    }

    const plantKey = seedToPlantMapping[itemKey];

    const targetSeed = {
      coordinates,
      map,
    } as IUseWithTargetSeed;

    return {
      itemKey,
      targetSeed,
      plantKey,
      useWithTileEffect,
    };
  }
}
