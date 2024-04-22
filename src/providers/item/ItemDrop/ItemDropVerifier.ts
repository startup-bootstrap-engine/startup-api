import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterBan } from "@providers/character/CharacterBan";
import { ITEM_CLEANUP_THRESHOLD } from "@providers/constants/ItemConstants";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(ItemDropVerifier)
export class ItemDropVerifier {
  constructor(
    private inMemoryHashTable: InMemoryHashTable,
    private socketMessaging: SocketMessaging,
    private characterBan: CharacterBan
  ) {}

  public async trackDrop(character: ICharacter, itemId: string): Promise<void> {
    const currentTime = this.getCurrentTime();
    const currentItemDrops: Record<string, Date> =
      (await this.inMemoryHashTable.get("item-drops", character._id)) || {};

    await this.inMemoryHashTable.set("item-drops", character._id, {
      ...currentItemDrops,
      [itemId]: currentTime,
    });
  }

  public async getItemDrops(character: ICharacter): Promise<Record<string, Date>> {
    return (await this.inMemoryHashTable.get("item-drops", character._id)) || {};
  }

  public async deleteItemFromCharacterFromDrop(character: ICharacter, itemId: string): Promise<void> {
    const currentItemDrops: Record<string, Date> =
      (await this.inMemoryHashTable.get("item-drops", character._id)) || {};

    delete currentItemDrops[itemId];

    await this.inMemoryHashTable.set("item-drops", character._id, currentItemDrops);
  }

  public async verifyAllCharacterItemDrops(): Promise<void> {
    try {
      const allCharacterIdsWithItemDrops = Object.keys((await this.inMemoryHashTable.getAll("item-drops")) || {});

      const characters = (await Character.find({ _id: { $in: allCharacterIdsWithItemDrops } }).lean()) as ICharacter[];

      for (const character of characters) {
        await this.verifyAndActOnCharacterItemDrops(character);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async verifyAndActOnCharacterItemDrops(character: ICharacter): Promise<void> {
    const oneHourAgo = dayjs().subtract(1, "hour");
    const itemDrops: Record<string, Date> = (await this.inMemoryHashTable.get("item-drops", character._id)) || {};
    const recentDrops = Object.values(itemDrops).filter((dropTime) => dayjs(dropTime).isAfter(oneHourAgo));

    const dropCount = recentDrops.length;

    if (dropCount > ITEM_CLEANUP_THRESHOLD) {
      this.socketMessaging.sendMessageToCharacter(
        character,
        "You have been banned for excessive item drops on the floor."
      );

      await this.characterBan.increasePenaltyAndBan(character);
    } else if (dropCount >= ITEM_CLEANUP_THRESHOLD / 2) {
      this.socketMessaging.sendMessageToCharacter(
        character,
        `You are close to being banned for excessive item drops on the floor. Please STOP right now! (Drop limit: ${dropCount}/${ITEM_CLEANUP_THRESHOLD})`
      );
    } else if (dropCount >= ITEM_CLEANUP_THRESHOLD / 3) {
      this.socketMessaging.sendMessageToCharacter(
        character,
        `You are dropping a lot of items on the floor. Please be careful! (Drop limit: ${dropCount}/${ITEM_CLEANUP_THRESHOLD})`
      );
    }
  }

  public async cleanupOldTrackedItemDropData(): Promise<void> {
    const oneHourAgo = dayjs().subtract(1, "hour");
    const allCharactersItemDrops = (await this.inMemoryHashTable.getAll("item-drops")) as Record<
      string,
      Record<string, Date>
    >;

    for (const characterId in allCharactersItemDrops) {
      const itemDrops = allCharactersItemDrops[characterId];

      const cleanedItemDrops = Object.entries(itemDrops).reduce((acc, [itemId, dropTime]) => {
        if (dayjs(dropTime).isAfter(oneHourAgo)) {
          acc[itemId] = dropTime; // Keep this item as it was dropped within the last hour
        }
        return acc;
      }, {} as Record<string, Date>);

      if (Object.keys(cleanedItemDrops).length === 0) {
        // If there are no drops, delete the character ID from the table
        await this.inMemoryHashTable.delete("item-drops", characterId);
      } else {
        await this.inMemoryHashTable.set("item-drops", characterId, cleanedItemDrops);
      }
    }
  }

  public async deleteAllItemDropsFromCharacter(character: ICharacter): Promise<void> {
    await this.inMemoryHashTable.delete("item-drops", character._id);
  }

  public async clearAllItemDrops(): Promise<void> {
    await this.inMemoryHashTable.deleteAll("item-drops");
  }

  private getCurrentTime(): Date {
    return new Date();
  }
}
