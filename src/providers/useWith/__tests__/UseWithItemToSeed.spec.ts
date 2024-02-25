import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { ItemType, SimpleTutorialSocketEvents } from "@rpg-engine/shared";
import { IUseWithItemToSeedOptions, UseWithItemToSeed } from "../abstractions/UseWithItemToSeed";

describe("UseWithItemToSeed.ts", () => {
  let useWithItemToSeed: UseWithItemToSeed;
  let testCharacter: ICharacter;
  let options: IUseWithItemToSeedOptions;
  let skillIncrease: SkillIncrease;
  let mockItemSave: jest.Mock;
  let sendMessageToCharacter: jest.SpyInstance;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let sendEventToUser: jest.SpyInstance;

  beforeAll(() => {
    useWithItemToSeed = container.get<UseWithItemToSeed>(UseWithItemToSeed);

    mockItemSave = jest.fn();
    Item.save = mockItemSave;
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasSkills: true,
      hasInventory: true,
      hasEquipment: true,
    });

    options = {
      map: "example",
      coordinates: {
        x: 0,
        y: 0,
      },
      key: "carrot",
      originItemKey: "carrot-seed",
      successMessage: "Planting Success",
      errorMessage: "Planting Failed!",
    };
    // @ts-ignore
    sendMessageToCharacter = jest.spyOn(useWithItemToSeed.socketMessaging, "sendMessageToCharacter");

    // @ts-ignore
    sendErrorMessageToCharacter = jest.spyOn(useWithItemToSeed.socketMessaging, "sendErrorMessageToCharacter");

    // @ts-ignore
    sendEventToUser = jest.spyOn(useWithItemToSeed.socketMessaging, "sendEventToUser");
  });

  it("should create a new plant and update inventory on successful execution", async () => {
    const mockIncreaseCraftingSP = jest.fn();
    const mockSkillIncrease = { increaseCraftingSP: mockIncreaseCraftingSP };

    // @ts-ignore
    await useWithItemToSeed.execute(testCharacter, options, mockSkillIncrease);

    const plant = await Item.findOne({
      where: {
        key: "carrot",
        owner: testCharacter.id,
      },
    });

    expect(mockIncreaseCraftingSP).toHaveBeenCalledWith(testCharacter, ItemType.Plant, true);
    expect(plant).toBeDefined();
    expect(sendMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Planting Success");
    expect(sendEventToUser).toHaveBeenCalledWith(
      testCharacter.channelId!,
      SimpleTutorialSocketEvents.SimpleTutorialWithKey,
      {
        key: "plant-seed",
      }
    );
  });

  it("should send an error message on failure ", async () => {
    options.key = "invalid-key";

    await useWithItemToSeed.execute(testCharacter, options, skillIncrease);

    const plant = await Item.findOne({
      where: {
        key: "invalid-key",
        owner: testCharacter.id,
      },
    });

    expect(plant).toBeNull();
    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Planting Failed!");
  });
});
