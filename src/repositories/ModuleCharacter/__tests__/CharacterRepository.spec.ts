import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Item } from "@entities/ModuleInventory/ItemModel";
import { CharacterItemInventory } from "@providers/character/characterItems/CharacterItemInventory";
import { INITIAL_STARTING_POINTS } from "@providers/constants/CharacterConstants";
import { container, unitTestHelper } from "@providers/inversify/container";
import {
  AccessoriesBlueprint,
  ArmorsBlueprint,
  AxesBlueprint,
  ContainersBlueprint,
  DaggersBlueprint,
  HelmetsBlueprint,
  SeedsBlueprint,
  SpearsBlueprint,
  StaffsBlueprint,
  SwordsBlueprint,
  ToolsBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { CharacterClass, CharacterFactions, Modes } from "@rpg-engine/shared";
import { CharacterRepository } from "../CharacterRepository";

describe("CharacterRepository.spec.ts", () => {
  let characterRepository: CharacterRepository;
  let testCharacter: ICharacter;
  let characterInventory: CharacterItemInventory;
  beforeAll(() => {
    characterRepository = container.get<CharacterRepository>(CharacterRepository);
    characterInventory = container.get<CharacterItemInventory>(CharacterItemInventory);
  });

  beforeEach(async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
    });
  });

  it("should generate correct initial items based on character class", async () => {
    const classesAndWeapons = [
      { class: CharacterClass.Rogue, left: DaggersBlueprint.Dagger, right: null },
      { class: CharacterClass.Druid, left: StaffsBlueprint.Wand, right: DaggersBlueprint.Dagger },
      { class: CharacterClass.Sorcerer, left: StaffsBlueprint.Wand, right: DaggersBlueprint.Dagger },
      { class: CharacterClass.Berserker, left: AxesBlueprint.Axe, right: null },
      { class: CharacterClass.Hunter, left: SpearsBlueprint.Spear },
      { class: CharacterClass.Warrior, left: SwordsBlueprint.Sword, right: null },
      { class: CharacterClass.None, left: DaggersBlueprint.Dagger, right: null },
    ];

    for (const { class: testClass, left } of classesAndWeapons) {
      testCharacter.class = testClass;
      // @ts-ignore
      const data = await characterRepository.generateInitialItems(testCharacter as ICharacter);
      const leftHandWeapon = await Item.findById(data.leftHand);
      expect(leftHandWeapon?.key).toEqual(left);
    }
  });

  it("should always generate bag, jacket, cap, boot, and bandana", async () => {
    // @ts-ignore
    const equipment = await characterRepository.generateInitialItems(testCharacter);
    const bag = await Item.findById(equipment.inventory);
    const jacket = await Item.findById(equipment.armor);
    const cap = await Item.findById(equipment.head);
    const bandana = await Item.findById(equipment.neck);

    expect(bag?.key).toEqual(ContainersBlueprint.Bag);
    expect(jacket?.key).toEqual(ArmorsBlueprint.Jacket);
    expect(cap?.key).toEqual(HelmetsBlueprint.Cap);
    expect(bandana?.key).toEqual(AccessoriesBlueprint.Bandana);
  });

  it("should generate correct starting scene for farming mode", async () => {
    const characterDto = {
      name: "test",
      class: CharacterClass.Rogue,
      race: "Human",
      faction: CharacterFactions.LifeBringer,
      mode: Modes.SoftMode,
      isFarmingMode: true,
      textureKey: "test",
    };

    const owner = testCharacter.owner as string;

    const character = await characterRepository.createCharacter(characterDto, owner);
    expect(character?.scene).toEqual(INITIAL_STARTING_POINTS["Farming Mode"]?.scene);
  });

  it("should generate correct basic seed and watering can if farming mode is enabled", async () => {
    testCharacter.isFarmingMode = true;

    // @ts-ignore
    await characterRepository.generateInventoryItems(testCharacter);

    const updatedCharacter = await Character.findById(testCharacter._id);

    const items = await characterInventory.getAllItemsFromInventoryNested(updatedCharacter as ICharacter);

    const seedItem = items.find((item) => item.key === SeedsBlueprint.CarrotSeed);
    const wateringCanItem = items.find((item) => item.key === ToolsBlueprint.WateringCan);

    expect(seedItem).not.toBeNull();
    expect(wateringCanItem).not.toBeNull();
  });
});
