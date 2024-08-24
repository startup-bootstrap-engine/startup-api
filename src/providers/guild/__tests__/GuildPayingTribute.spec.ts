/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { IGuild } from "@entities/ModuleSystem/GuildModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { FoodsBlueprint, OthersBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import _ from "lodash";
import mongoose from "mongoose";
import { GuildPayingTribute } from "../GuildPayingTribute";

describe("GuildPayingTribute.ts", () => {
  let guildPayingTribute: GuildPayingTribute;
  let testCharacter: ICharacter;
  let testGuild: IGuild;

  const mockSocketMessaging = {
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildPayingTribute = container.get<GuildPayingTribute>(GuildPayingTribute);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testGuild = await unitTestHelper.createMockGuild();

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

  const setupMocks = (item: IItem, map: string, lootShare = 20) => {
    const testGuildTerritory = { map, lootShare } as any;
    testGuild.territoriesOwned.push(testGuildTerritory);

    jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getGuildByTerritoryMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const ObjectId = new mongoose.Types.ObjectId();
    const mockLeanFn = jest.fn().mockResolvedValue({ _id: ObjectId } as any);
    jest.spyOn(ItemContainer, "findOne").mockReturnValue({ lean: mockLeanFn } as any);

    const mockAddItemToContainerSpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.characterItemContainer, "addItemToContainer")
      .mockResolvedValue(true);

    return { mockAddItemToContainerSpy, ObjectId };
  };

  const runTributeTest = async (item: IItem, expectedMessage: string, expectedResult: number) => {
    const result = await guildPayingTribute.payTribute(testCharacter, item);

    jest.advanceTimersByTime(3000);

    expect(result).toBe(expectedResult);
    expect(mockSocketMessaging.sendMessageToCharacter).toHaveBeenCalledWith(testCharacter, expectedMessage);
  };

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

    // @ts-ignore
    const mockGuildCommonSpy = jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

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

  it("should pay tribute for a gold coin item", async () => {
    const testItem = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
      stackQty: 10,
    });

    const { mockAddItemToContainerSpy, ObjectId } = setupMocks(testItem, testItem.scene!);

    const expectedMessage = `Tribute(s) paid to ${testGuild.name}: 1x gold`;
    await runTributeTest(testItem, expectedMessage, 9);

    expect(mockAddItemToContainerSpy).toHaveBeenCalledWith(
      expect.objectContaining({ stackQty: 1 }),
      testCharacter,
      ObjectId
    );
  });

  it("should pay tribute for a non-gold coin item, with lower random number", async () => {
    jest.spyOn(_, "random").mockReturnValue(2);

    const testItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Banana, {
      stackQty: 10,
    });

    const expectedMessage = `Tribute(s) paid to ${testGuild.name}: 2x ${testItem2.name}`;
    await runTributeTest(testItem2, expectedMessage, 8);
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
