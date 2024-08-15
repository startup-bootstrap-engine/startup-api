import { CharacterBuff, ICharacterBuff } from "@entities/ModuleCharacter/CharacterBuffModel";
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { GUILD_BUFFS, GUILD_LEVEL_BONUS, GUILD_LEVEL_BONUS_MAX } from "@providers/constants/GuildConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import { CharacterBuffDurationType, CharacterBuffType } from "@rpg-engine/shared";
import mongoose from "mongoose";
import { GuildLevelBonus } from "../GuildLevelBonus";

describe("GuildLevelBonus.ts", () => {
  let guildLevelBonus: GuildLevelBonus;
  let testCharacter: ICharacter;

  const mockSocketMessaging = {
    sendErrorMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildLevelBonus = container.get<GuildLevelBonus>(GuildLevelBonus);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
    });
    await testCharacter.populate("skills").execPopulate();

    // @ts-ignore
    guildLevelBonus.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it("should apply buffs for all GUILD_BUFFS", async () => {
    const guildLevel = 5;
    const buffPercentage = guildLevel * GUILD_LEVEL_BONUS;

    const enablePermanentBuffSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildLevelBonus.characterBuffActivator, "enablePermanentBuff")
      .mockResolvedValueOnce(null);

    await guildLevelBonus.applyCharacterBuff(testCharacter, guildLevel);

    expect(enablePermanentBuffSpy).toHaveBeenCalledTimes(GUILD_BUFFS.length);
    GUILD_BUFFS.forEach((trait) => {
      expect(enablePermanentBuffSpy).toHaveBeenCalledWith(
        testCharacter,
        expect.objectContaining({
          type: CharacterBuffType.Skill,
          trait: trait,
          buffPercentage,
          durationType: CharacterBuffDurationType.Permanent,
          originateFrom: "guild",
        }),
        false
      );
    });
  });

  it("should send error message and return when guild level bonus is maxed out", async () => {
    const enablePermanentBuffSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildLevelBonus.characterBuffActivator, "enablePermanentBuff")
      .mockResolvedValueOnce(null);

    await guildLevelBonus.applyCharacterBuff(testCharacter, 1000);

    expect(mockSocketMessaging.sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      "Guild level bonus has reached its maximum."
    );
    GUILD_BUFFS.forEach((trait) => {
      expect(enablePermanentBuffSpy).toHaveBeenCalledWith(
        testCharacter,
        expect.objectContaining({
          type: CharacterBuffType.Skill,
          trait: trait,
          buffPercentage: GUILD_LEVEL_BONUS_MAX,
          durationType: CharacterBuffDurationType.Permanent,
          originateFrom: "guild",
        }),
        false
      );
    });
  });

  it("should disable existing buffs before applying new ones", async () => {
    const guildLevel = 5;

    const existingBuffs = GUILD_BUFFS.map((trait) => ({
      _id: new mongoose.Types.ObjectId(),
      trait,
      owner: testCharacter._id,
      durationType: CharacterBuffDurationType.Permanent,
      originateFrom: "guild",
    })) as ICharacterBuff[];

    jest.spyOn(CharacterBuff, "find").mockReturnValue({
      lean: jest.fn().mockResolvedValue(existingBuffs),
    } as any);

    const disableBuffSpy = jest
      // @ts-ignore
      .spyOn<any, any>(guildLevelBonus.characterBuffActivator, "disableBuff")
      .mockResolvedValueOnce(null);

    await guildLevelBonus.applyCharacterBuff(testCharacter, guildLevel);

    expect(disableBuffSpy).toHaveBeenCalledTimes(GUILD_BUFFS.length);

    GUILD_BUFFS.forEach((trait, index) => {
      expect(disableBuffSpy).toHaveBeenNthCalledWith(
        index + 1,
        testCharacter,
        existingBuffs[index]._id,
        CharacterBuffType.Skill,
        true
      );
    });
  });

  it("should remove all guild buffs from the character", async () => {
    const existingBuffs = GUILD_BUFFS.map((trait) => ({
      _id: new mongoose.Types.ObjectId(),
      trait,
    }));

    // Mock CharacterBuff.find to return existingBuffs
    jest.spyOn(CharacterBuff, "find").mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(existingBuffs),
    } as any);

    const disableBuffSpy = jest
      // @ts-ignore
      .spyOn(guildLevelBonus.characterBuffActivator, "disableBuff")
      // @ts-ignore
      .mockResolvedValueOnce(null);

    await guildLevelBonus.removeCharacterBuff(testCharacter);

    expect(disableBuffSpy).toHaveBeenCalledTimes(GUILD_BUFFS.length);
    existingBuffs.forEach((buff, index) => {
      expect(disableBuffSpy).toHaveBeenNthCalledWith(
        index + 1,
        testCharacter,
        buff._id,
        CharacterBuffType.Skill,
        false
      );
    });
  });

  it("should not call disableBuff if no buffs are found", async () => {
    // Mock CharacterBuff.find to return an empty array
    jest.spyOn(CharacterBuff, "find").mockReturnValue({
      lean: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([]),
    } as any);

    const disableBuffSpy = jest
      // @ts-ignore
      .spyOn(guildLevelBonus.characterBuffActivator, "disableBuff")
      // @ts-ignore
      .mockResolvedValueOnce(null);

    await guildLevelBonus.removeCharacterBuff(testCharacter);

    expect(CharacterBuff.find).toHaveBeenCalled();
    expect(disableBuffSpy).not.toHaveBeenCalled();
  });

  it("should not call disableBuff if no buff is found", async () => {
    const mockQuery = {
      lean: jest.fn().mockReturnThis(),
      cacheQuery: jest.fn().mockResolvedValue(null),
      select: jest.fn().mockResolvedValue(null),
    };

    jest.spyOn(CharacterBuff, "findOne").mockReturnValueOnce(mockQuery as any);

    const disableBuffSpy = jest
      // @ts-ignore
      .spyOn(guildLevelBonus.characterBuffActivator, "disableBuff")
      // @ts-ignore
      .mockResolvedValueOnce(null);

    await guildLevelBonus.removeCharacterBuff(testCharacter);

    expect(disableBuffSpy).not.toHaveBeenCalled();
  });
});
