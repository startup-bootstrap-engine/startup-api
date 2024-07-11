import { CharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { CharacterBuffDurationType, CharacterTrait, ICharacterBuff, ICharacterItemBuff } from "@rpg-engine/shared";
import { provide } from "inversify-binding-decorators";
import { Types } from "mongoose";
import { clearCacheForKey } from "speedgoose";

interface ICharacterBuffDeleteOptions {
  deleteTemporaryOnly?: boolean;
}

@provide(CharacterBuffTracker)
export class CharacterBuffTracker {
  constructor(private inMemoryHashTable: InMemoryHashTable) {}

  @TrackNewRelicTransaction()
  public async addBuff(characterId: string, buff: ICharacterBuff): Promise<ICharacterBuff | undefined> {
    try {
      const newCharacterBuff = new CharacterBuff({
        owner: characterId,
        ...buff,
      });
      // eslint-disable-next-line mongoose-lean/require-lean
      await newCharacterBuff.save();

      await this.clearCache(characterId, buff.trait);

      return newCharacterBuff.toObject() as ICharacterBuff;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @TrackNewRelicTransaction()
  public async getAllCharacterBuffs(characterId: string): Promise<ICharacterBuff[]> {
    const allCharacterBuffs = await CharacterBuff.find({ owner: characterId })
      .lean<ICharacterBuff[]>()
      .cacheQuery({
        cacheKey: `characterBuffs_${characterId}`,
      });

    return allCharacterBuffs;
  }

  @TrackNewRelicTransaction()
  public async hasBuffs(characterId: string): Promise<boolean> {
    const count = await CharacterBuff.countDocuments({ owner: characterId });
    return count > 0;
  }

  public async hasBuffsByTrait(characterId: string, trait: CharacterTrait): Promise<boolean> {
    const count = await CharacterBuff.countDocuments({ owner: characterId, trait });
    return count > 0;
  }

  @TrackNewRelicTransaction()
  public async getAllBuffAbsoluteChanges(characterId: string, trait: CharacterTrait): Promise<number> {
    const result = await CharacterBuff.aggregate([
      { $match: { owner: Types.ObjectId(characterId), trait } },
      { $group: { _id: null, totalChange: { $sum: "$absoluteChange" } } },
    ]);

    return result[0]?.totalChange || 0;
  }

  @TrackNewRelicTransaction()
  public async getAllBuffPercentageChanges(characterId: string, trait: CharacterTrait): Promise<number> {
    const result = await CharacterBuff.aggregate([
      { $match: { owner: Types.ObjectId(characterId), trait } },
      { $group: { _id: null, totalPercentage: { $sum: "$buffPercentage" } } },
    ]);

    return result[0]?.totalPercentage || 0;
  }

  @TrackNewRelicTransaction()
  public async getBuffsByItemId(characterId: string, itemId: string): Promise<ICharacterItemBuff[]> {
    const query = {
      owner: Types.ObjectId(characterId),
      itemId: itemId, // Keep itemId as string
    };
    return await CharacterBuff.find(query).lean<ICharacterItemBuff[]>();
  }

  @TrackNewRelicTransaction()
  public async getBuffByItemKey(character: ICharacter, itemKey: string): Promise<ICharacterItemBuff | null> {
    return await CharacterBuff.findOne({ owner: character._id, itemKey }).lean<ICharacterItemBuff>();
  }

  @TrackNewRelicTransaction()
  public async getBuff(characterId: string, buffId: string): Promise<ICharacterBuff | undefined> {
    try {
      const buff = (await CharacterBuff.findOne({ _id: buffId, owner: characterId })
        .lean()
        .cacheQuery({
          cacheKey: `characterBuff_${characterId}_${buffId}`,
        })) as ICharacterBuff;

      return buff;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @TrackNewRelicTransaction()
  public async deleteBuff(character: ICharacter, buffId: string, skillName: string): Promise<boolean> {
    try {
      const result = await CharacterBuff.deleteOne({ _id: buffId, owner: character._id });
      if (result.deletedCount === 0) {
        throw new Error("Buff not found");
      }

      await this.clearCache(character._id, skillName);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async deleteAllCharacterBuffs(character: ICharacter, options?: ICharacterBuffDeleteOptions): Promise<boolean> {
    try {
      const query: Record<string, any> = { owner: character._id };
      if (options?.deleteTemporaryOnly) {
        query.durationType = CharacterBuffDurationType.Temporary;
      }

      await CharacterBuff.deleteMany(query);
      await this.clearCache(character._id);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  public async clearCache(characterId: string, skillName?: string): Promise<void> {
    await clearCacheForKey(`characterBuffs_${characterId}`);
    await clearCacheForKey(`${characterId}-skills`);
    await this.inMemoryHashTable.delete("skills-with-buff", characterId);
    await this.inMemoryHashTable.delete(characterId.toString(), "totalAttack");
    await this.inMemoryHashTable.delete(characterId.toString(), "totalDefense");
    skillName && (await this.inMemoryHashTable.delete(`${characterId}-skill-level-with-buff`, skillName));
  }
}
