/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FoodsBlueprint, OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import _ from "lodash";
import { GuildPayingTribute } from "../GuildPayingTribute";

describe("GuildPayingTribute.ts", () => {
  let guildPayingTribute: GuildPayingTribute;
  let testCharacter: ICharacter;
  let testGuildLeaderCharacter: ICharacter;
  let testGuild: IGuild;

  const mockSocketMessaging = {
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildPayingTribute = container.get<GuildPayingTribute>(GuildPayingTribute);
  });

  beforeEach(async () => {
    testGuildLeaderCharacter = await unitTestHelper.createMockCharacter(null, {
      hasInventory: true,
      hasEquipment: true,
    });

    testCharacter = await unitTestHelper.createMockCharacter(null, { hasInventory: true, hasEquipment: true });
    testGuild = await unitTestHelper.createMockGuild({
      guildLeader: testGuildLeaderCharacter._id,
    });

    // @ts-ignore
    guildPayingTribute.socketMessaging = mockSocketMessaging;

    jest.useFakeTimers({
      advanceTimers: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  const runTributeTest = async (item: IItem, expectedMessage: string, expectedResult: number) => {
    const result = await guildPayingTribute.payTribute(testCharacter, item);

    jest.advanceTimersByTime(3000);

    expect(result).toBe(expectedResult);
    // Disabled because message is now commented out GuildPayingTribute.ts:125
    // expect(mockSocketMessaging.sendMessageToCharacter).toHaveBeenNthCalledWith(
    //   2,
    //   expect.objectContaining({ _id: testCharacter._id }),
    //   expectedMessage
    // );
  };

  it("should pay tribute for a gold coin item", async () => {
    const testItem = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
      stackQty: 10,
    });

    const expectedMessage = `Tribute(s) paid to guild ${testGuild.name}: 1x Gold Coin`;
    await runTributeTest(testItem, expectedMessage, 9);
  });

  it("should not pay tribute for a non-gold coin item, with higher random number", async () => {
    jest.spyOn(_, "random").mockReturnValue(80);

    const testItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Banana, {
      stackQty: 10,
    });

    const result = await guildPayingTribute.payTribute(testCharacter, testItem2);

    expect(result).toBe(10); // no tribute is paid
    // no message is sent
    expect(mockSocketMessaging.sendMessageToCharacter).not.toHaveBeenCalled();
  });

  describe("Edge cases", () => {
    it("should not pay tribute if there is no guild for the character's scene", async () => {
      const mockGuildTerritorySpy = jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildTerritory, "getGuildByTerritoryMap")
        .mockResolvedValue(null);

      const result = await guildPayingTribute.payTribute(
        testCharacter,
        await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
          stackQty: 10,
        })
      );

      expect(result).toBe(10);
      expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
    });

    it("should not pay tribute if the character is in the guild that owns the territory", async () => {
      const mockGuildTerritorySpy = jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildTerritory, "getGuildByTerritoryMap")
        .mockResolvedValue(testGuild);

      const mockGuildCommonSpy = jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildCommon, "getCharactersGuild")
        .mockResolvedValue(testGuild);

      const result = await guildPayingTribute.payTribute(
        testCharacter,
        await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
          stackQty: 10,
        })
      );

      expect(result).toBe(10);
      expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
      expect(mockGuildCommonSpy).toHaveBeenCalledWith(testCharacter);
    });

    it("should not pay tribute if there is no territory for the character's scene", async () => {
      const mockGuildTerritorySpy = jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildTerritory, "getGuildByTerritoryMap")
        .mockResolvedValue(testGuild);

      const mockGuildCommonSpy = jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildCommon, "getCharactersGuild")
        .mockResolvedValue(null);

      const mockGetTerritoriesSpy = jest.spyOn(testGuild, "territoriesOwned", "get").mockReturnValue([]);

      const result = await guildPayingTribute.payTribute(
        testCharacter,
        await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
          stackQty: 10,
        })
      );

      expect(result).toBe(10);
      expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
      expect(mockGuildCommonSpy).toHaveBeenCalledWith(testCharacter);
      expect(mockGetTerritoriesSpy).toHaveBeenCalled();
    });

    it("should return 0 if the item stack quantity is 0", async () => {
      const testItem = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
        stackQty: 0,
      });

      jest
        // @ts-ignore
        .spyOn(guildPayingTribute.guildTerritory, "getGuildByTerritoryMap")
        .mockResolvedValue(testGuild);

      // @ts-ignore
      jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

      const testGuildTerritory = { map: testItem.scene, lootShare: 20 } as any;

      testGuild.territoriesOwned.push(testGuildTerritory);

      const result = await guildPayingTribute.payTribute(testCharacter, testItem);

      expect(result).toBe(0);
    });
  });
});
