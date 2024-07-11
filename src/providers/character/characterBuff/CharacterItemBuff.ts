import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { blueprintManager } from "@providers/inversify/container";
import { AvailableBlueprints } from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { ICharacterItemBuff, ICharacterPermanentBuff, IEquippableItemBlueprint, IItemGem } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { CharacterBuffActivator } from "./CharacterBuffActivator";
import { CharacterBuffTracker } from "./CharacterBuffTracker";

@provide(CharacterItemBuff)
export class CharacterItemBuff {
  constructor(
    private characterBuff: CharacterBuffActivator,
    private characterBuffTracker: CharacterBuffTracker,
    private socketMessaging: SocketMessaging
  ) {}

  @TrackNewRelicTransaction()
  public async enableItemBuff(character: ICharacter, item: IItem): Promise<void> {
    const itemBlueprint = await blueprintManager.getBlueprint<IEquippableItemBlueprint>(
      "items",
      item.baseKey as AvailableBlueprints
    );

    const equippedBuffs: ICharacterPermanentBuff[] = [];

    if (item.attachedGems) {
      for (const gem of item.attachedGems) {
        if (gem.key) {
          const gemBlueprints = (await blueprintManager.getBlueprint("items", gem.key)) as IItemGem;
          if (gemBlueprints.gemEquippedBuffAdd) {
            const gemBuffsToAdd = Array.isArray(gemBlueprints.gemEquippedBuffAdd)
              ? gemBlueprints.gemEquippedBuffAdd
              : [gemBlueprints.gemEquippedBuffAdd];
            equippedBuffs.push(...gemBuffsToAdd);
          }
        }
      }
    }

    if (!itemBlueprint || (!itemBlueprint.equippedBuff && equippedBuffs.length === 0)) {
      return;
    }

    if (itemBlueprint.equippedBuff) {
      const itemBuffsToAdd = Array.isArray(itemBlueprint.equippedBuff)
        ? itemBlueprint.equippedBuff
        : [itemBlueprint.equippedBuff];
      equippedBuffs.push(...itemBuffsToAdd);
    }

    try {
      const messages = (
        await Promise.all(
          equippedBuffs.map(async (buff) => {
            // avoid same item stacking
            const hasSameItemBuff = await this.characterBuffTracker.getBuffsByItemId(character._id, item._id);

            if (hasSameItemBuff.length > 0) {
              return null; // return null instead of sending a message
            }

            const buffData: ICharacterItemBuff = {
              ...buff,
              itemId: item._id,
              itemKey: item.baseKey,
            };

            await this.characterBuff.enablePermanentBuff(character, buffData, true);
            return buffData.options?.messages?.activation || "";
          })
        )
      ).filter(Boolean); // filter out null messages

      if (messages.length > 0) {
        this.socketMessaging.sendMessageToCharacter(character, messages.join(" "));
      }
    } catch (error) {
      console.error(`An error occurred while enabling the buff: ${error}`);
    }
  }

  @TrackNewRelicTransaction()
  public async disableItemBuff(character: ICharacter, itemId: string): Promise<void> {
    try {
      const itemBuffs = await this.characterBuffTracker.getBuffsByItemId(character._id, itemId);

      if (itemBuffs.length === 0) {
        return;
      }

      const messages: string[] = await Promise.all(
        itemBuffs.map(async (buff) => {
          if (!buff._id) {
            throw new Error(`Buff id is null or undefined for item id: ${itemId}`);
          }

          await this.characterBuff.disableBuff(character, buff._id, buff.type, true);
          return buff.options?.messages?.deactivation || "";
        })
      );

      this.socketMessaging.sendMessageToCharacter(character, messages.join(" "));
    } catch (err) {
      console.error(err);
    }
  }
}
