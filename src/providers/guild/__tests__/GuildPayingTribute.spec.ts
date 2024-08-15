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
  let testItem: IItem;
  let testItem2: IItem;
  let testGuild: IGuild;

  const mockSocketMessaging = {
    sendMessageToCharacter: jest.fn(),
  };

  beforeAll(() => {
    guildPayingTribute = container.get<GuildPayingTribute>(GuildPayingTribute);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testItem = await unitTestHelper.createMockItemFromBlueprint(OthersBlueprint.GoldCoin, {
      stackQty: 10,
    });

    testItem2 = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Banana, {
      stackQty: 10,
    });

    testGuild = await unitTestHelper.createMockGuild();

    // @ts-ignore
    guildPayingTribute.socketMessaging = mockSocketMessaging;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should not pay tribute if there is no guild for the character's scene", async () => {
    const mockGuildTerritorySpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(null);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem);

    expect(result).toBe(0);
    expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
  });

  it("should not pay tribute if the character is in the guild that owns the territory", async () => {
    const mockGuildTerritorySpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    const mockGuildCommonSpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildCommon, "getCharactersGuild")
      .mockResolvedValue(testGuild);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem);

    expect(result).toBe(0);
    expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
    expect(mockGuildCommonSpy).toHaveBeenCalledWith(testCharacter);
  });

  it("should not pay tribute if there is no territory for the character's scene", async () => {
    const mockGuildTerritorySpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    const mockGuildCommonSpy = jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const mockGetTerritoriesSpy = jest.spyOn(testGuild, "territoriesOwned", "get").mockReturnValue([]);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem);

    expect(result).toBe(0);
    expect(mockGuildTerritorySpy).toHaveBeenCalledWith(testCharacter.scene);
    expect(mockGuildCommonSpy).toHaveBeenCalledWith(testCharacter);
    expect(mockGetTerritoriesSpy).toHaveBeenCalled();
  });

  it("should pay tribute for a gold coin item", async () => {
    jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const testGuildTerritory = { map: testItem.scene, lootShare: 20 } as any;

    testGuild.territoriesOwned.push(testGuildTerritory);

    const mockAddItemToContainerSpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.characterItemContainer, "addItemToContainer")
      .mockResolvedValue(true);

    const ObjectId = new mongoose.Types.ObjectId();
    const mockLeanFn = jest.fn().mockResolvedValue({ _id: ObjectId } as any);
    jest.spyOn(ItemContainer, "findOne").mockReturnValue({ lean: mockLeanFn } as any);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem);

    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(testItem.stackQty!);
    expect(mockSocketMessaging.sendMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,

      `You have paid ${result} gold to ${testGuild.name} guild as territory tribute from ${testItem.stackQty}`
    );
    expect(mockAddItemToContainerSpy).toHaveBeenCalledWith(
      expect.objectContaining({ stackQty: result }),
      testCharacter,
      ObjectId
    );
  });

  it("should pay tribute for a non-gold coin item, with lower random number", async () => {
    jest.spyOn(_, "random").mockReturnValue(2);

    jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const testGuildTerritory = { map: testItem2.scene, lootShare: 20 } as any;
    testGuild.territoriesOwned.push(testGuildTerritory);

    const mockAddItemToContainerSpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.characterItemContainer, "addItemToContainer")
      .mockResolvedValue(true);

    const ObjectId = new mongoose.Types.ObjectId();
    const mockLeanFn = jest.fn().mockResolvedValue({ _id: ObjectId } as any);
    jest.spyOn(ItemContainer, "findOne").mockReturnValue({ lean: mockLeanFn } as any);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem2);

    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(testItem2.stackQty!);
    expect(mockSocketMessaging.sendMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      expect.stringContaining(
        `You have paid ${result} ${testItem2.name} to ${testGuild.name} guild as territory tribute from ${testItem2.stackQty}`
      )
    );
    expect(mockAddItemToContainerSpy).toHaveBeenCalledWith(
      expect.objectContaining({ stackQty: result }),
      testCharacter,
      ObjectId
    );
  });

  it("should not pay tribute for a non-gold coin item, with higher random number", async () => {
    jest.spyOn(_, "random").mockReturnValue(80);

    jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const testGuildTerritory = { map: testItem2.scene, lootShare: 20 } as any;
    testGuild.territoriesOwned.push(testGuildTerritory);

    const mockAddItemToContainerSpy = jest
      // @ts-ignore
      .spyOn(guildPayingTribute.characterItemContainer, "addItemToContainer")
      .mockResolvedValue(true);

    const ObjectId = new mongoose.Types.ObjectId();
    const mockLeanFn = jest.fn().mockResolvedValue({ _id: ObjectId } as any);
    jest.spyOn(ItemContainer, "findOne").mockReturnValue({ lean: mockLeanFn } as any);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem2);

    expect(result).toBe(0);
    expect(mockAddItemToContainerSpy).not.toHaveBeenCalled();
  });

  it("should return 0 if the item stack quantity is 0", async () => {
    testItem.stackQty = 0;

    jest
      // @ts-ignore
      .spyOn(guildPayingTribute.guildTerritory, "getTerritoryOwnedByMap")
      .mockResolvedValue(testGuild);

    // @ts-ignore
    jest.spyOn(guildPayingTribute.guildCommon, "getCharactersGuild").mockResolvedValue(null);

    const testGuildTerritory = { map: testItem.scene, lootShare: 20 } as any;

    testGuild.territoriesOwned.push(testGuildTerritory);

    const result = await guildPayingTribute.payTribute(testCharacter, testItem);

    expect(result).toBe(0);
  });
});
