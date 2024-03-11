import { ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { CraftingSkill, IBaseItemBlueprint, ItemType } from "@rpg-engine/shared";
import { IUseWithItemToSeedOptions, UseWithItemToSeed } from "../abstractions/UseWithItemToSeed";

describe("UseWithItemToSeed.ts", () => {
  let useWithItemToSeed: UseWithItemToSeed;
  let testCharacter: ICharacter;
  let options: IUseWithItemToSeedOptions;
  let skillIncrease: SkillIncrease;
  let mockItemSave: jest.Mock;
  let sendMessageToCharacter: jest.SpyInstance;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let sendSimpleTutorialAction: jest.SpyInstance;
  let blueprintManager: BlueprintManager;
  let itemBlueprint: IBaseItemBlueprint;

  beforeAll(() => {
    useWithItemToSeed = container.get<UseWithItemToSeed>(UseWithItemToSeed);
    blueprintManager = container.get<BlueprintManager>(BlueprintManager);

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
    sendSimpleTutorialAction = jest.spyOn(useWithItemToSeed.simpleTutorial, "sendSimpleTutorialActionToCharacter");

    itemBlueprint = (await blueprintManager.getBlueprint("items", options.originItemKey)) as IBaseItemBlueprint;
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
    expect(sendSimpleTutorialAction).toHaveBeenCalledWith(testCharacter, "plant-seed");
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

  it("should send an error message when minimum requirements are not met", async () => {
    const level = 5;
    const skillLevel = 10;
    const skill = CraftingSkill.Farming;

    itemBlueprint.minRequirements = {
      level: level,
      skill: {
        name: skill,
        level: skillLevel,
      },
    };

    await useWithItemToSeed.execute(testCharacter, options, skillIncrease);

    expect(sendErrorMessageToCharacter).toHaveBeenCalledWith(
      testCharacter,
      `Sorry, this seed requires level ${level} and ${skillLevel} level in ${skill}`
    );
  });
});
