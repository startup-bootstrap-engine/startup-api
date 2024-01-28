import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { IUseWithItemToSeedOptions, UseWithItemToSeed } from "../abstractions/UseWithItemToSeed";

describe("UseWithItemToSeed.ts", () => {
  let useWithItemToSeed: UseWithItemToSeed;
  let testCharacter: ICharacter;
  let options: IUseWithItemToSeedOptions;
  let skillIncrease: SkillIncrease;
  let mockItemSave: jest.Mock;
  let sendMessageToCharacter: jest.SpyInstance;
  let sendErrorMessageToCharacter: jest.SpyInstance;

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
  });

  it("should create a new plant and update inventory on successful execution", async () => {
    await useWithItemToSeed.execute(testCharacter, options, skillIncrease);

    const plant = await Item.findOne({
      where: {
        key: "carrot",
        owner: testCharacter.id,
      },
    });

    expect(plant).toBeDefined();
    expect(sendMessageToCharacter).toHaveBeenCalledWith(testCharacter, "Planting Success");
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
