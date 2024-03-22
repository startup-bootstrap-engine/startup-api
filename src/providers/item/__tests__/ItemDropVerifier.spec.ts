import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { ITEM_CLEANUP_THRESHOLD } from "@providers/constants/ItemConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import dayjs from "dayjs";
import { ItemDropVerifier } from "../ItemDropVerifier";

describe("ItemDropVerifier", () => {
  let itemDropVerifier: ItemDropVerifier;
  let testCharacter: ICharacter;
  let anotherCharacter: ICharacter;
  let testItem: IItem;
  let sendMessageToCharacterSpy: jest.SpyInstance;
  let increasePenaltyAndBanSpy: jest.SpyInstance;

  beforeAll(() => {
    itemDropVerifier = container.get(ItemDropVerifier);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter();
    testItem = await unitTestHelper.createMockItem();

    // @ts-ignore
    sendMessageToCharacterSpy = jest.spyOn(itemDropVerifier.socketMessaging, "sendMessageToCharacter");

    // @ts-ignore
    increasePenaltyAndBanSpy = jest.spyOn(itemDropVerifier.characterBan, "increasePenaltyAndBan");
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    await itemDropVerifier.clearAllItemDrops();
  });

  it("should successfully track an item drop", async () => {
    await itemDropVerifier.trackDrop(testCharacter, testItem._id);

    const characterItemDrops = await itemDropVerifier.getItemDrops(testCharacter);

    const dateDropped = new Date(characterItemDrops[testItem._id]);

    expect(dateDropped).toEqual(expect.any(Date));
  });

  it("deletes a specific item drop from a character", async () => {
    await itemDropVerifier.trackDrop(testCharacter, testItem._id);
    await itemDropVerifier.deleteItemFromCharacterFromDrop(testCharacter, testItem._id);

    const characterItemDrops = await itemDropVerifier.getItemDrops(testCharacter);

    expect(characterItemDrops).not.toHaveProperty(String(testItem._id));
  });

  it("handle multi character item drop tracking", async () => {
    anotherCharacter = await unitTestHelper.createMockCharacter();

    await itemDropVerifier.trackDrop(testCharacter, testItem._id);
    await itemDropVerifier.trackDrop(anotherCharacter, testItem._id);

    const testCharacterDrops = await itemDropVerifier.getItemDrops(testCharacter);
    const anotherCharacterDrops = await itemDropVerifier.getItemDrops(anotherCharacter);

    expect(testCharacterDrops).toEqual(
      expect.objectContaining({
        [testItem._id]: expect.any(String),
      })
    );
    expect(anotherCharacterDrops).toEqual(
      expect.objectContaining({
        [testItem._id]: expect.any(String),
      })
    );
  });

  it("warns character as threshold approaches", async () => {
    const warningThreshold = ITEM_CLEANUP_THRESHOLD / 2; // Assuming warning is issued at 50% of ban threshold
    for (let i = 0; i < warningThreshold; i++) {
      await itemDropVerifier.trackDrop(testCharacter, `item-${i}`);
    }
    await itemDropVerifier.verifyAndActOnCharacterItemDrops(testCharacter);
    expect(sendMessageToCharacterSpy).toHaveBeenCalledWith(
      testCharacter,
      expect.stringContaining("close to being banned")
    );
    expect(increasePenaltyAndBanSpy).not.toHaveBeenCalled();
  });

  it("bans character after exceeding threshold", async () => {
    for (let i = 0; i <= ITEM_CLEANUP_THRESHOLD; i++) {
      await itemDropVerifier.trackDrop(testCharacter, `item-${i}`);
    }
    await itemDropVerifier.verifyAndActOnCharacterItemDrops(testCharacter);
    expect(increasePenaltyAndBanSpy).toHaveBeenCalledWith(testCharacter);
  });

  it("does not issue warnings or bans for drops below warning threshold", async () => {
    for (let i = 0; i < 5; i++) {
      // Stay significantly below the warning threshold
      await itemDropVerifier.trackDrop(testCharacter, `item-${i}`);
    }
    await itemDropVerifier.verifyAndActOnCharacterItemDrops(testCharacter);
    expect(sendMessageToCharacterSpy).not.toHaveBeenCalledWith(testCharacter, expect.any(String));
    expect(increasePenaltyAndBanSpy).not.toHaveBeenCalled();
  });

  it("cleans up item drops older than 1 hour", async () => {
    await itemDropVerifier.trackDrop(testCharacter, "recent-item");

    // @ts-ignore
    jest.spyOn(itemDropVerifier, "getCurrentTime").mockReturnValue(dayjs().subtract(2, "hour").toDate());

    await itemDropVerifier.trackDrop(testCharacter, testItem._id);

    await itemDropVerifier.cleanupOldTrackedItemDropData();

    const currentDrops = await itemDropVerifier.getItemDrops(testCharacter);

    expect(currentDrops).toEqual(
      expect.objectContaining({
        "recent-item": expect.any(String),
      })
    );
  });

  it("properly verifies all character item drops", async () => {
    anotherCharacter = await unitTestHelper.createMockCharacter();

    for (let i = 0; i < ITEM_CLEANUP_THRESHOLD - 1; i++) {
      await itemDropVerifier.trackDrop(testCharacter, `item-${i}`);
      await itemDropVerifier.trackDrop(anotherCharacter, `item-${i}`);
    }

    await itemDropVerifier.verifyAllCharacterItemDrops();

    expect(sendMessageToCharacterSpy).toHaveBeenCalledTimes(2);
  });
});
