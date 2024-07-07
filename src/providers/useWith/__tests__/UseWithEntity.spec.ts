/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { ISkill } from "@entities/ModuleCharacter/SkillsModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { CharacterValidation } from "@providers/character/CharacterValidation";
import { blueprintManager, container, unitTestHelper } from "@providers/inversify/container";
import { itemDarkRune } from "@providers/item/data/blueprints/magics/ItemDarkRune";
import { FoodsBlueprint, MagicsBlueprint, ToolsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";
import { ItemValidation } from "@providers/item/validation/ItemValidation";
import { MovementHelper } from "@providers/movement/MovementHelper";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import {
  CharacterSocketEvents,
  GRID_WIDTH,
  ItemSocketEvents,
  MagicPower,
  NPCAlignment,
  NPCMovementType,
  UISocketEvents,
} from "@rpg-engine/shared";
import { EntityType } from "@rpg-engine/shared/dist/types/entity.types";
import mongoose from "mongoose";
import { IUseWithItemSource, UseWithEntity } from "../abstractions/UseWithEntity";

describe("UseWithEntity.ts", () => {
  let useWithEntity: UseWithEntity;
  let testCharacter: ICharacter;
  let targetCharacter: ICharacter;
  let testNPC: INPC;
  let characterSkills: ISkill;
  let targetCharacterSkills: ISkill;
  let item1: IItem;
  // eslint-disable-next-line no-unused-vars
  let healRune: IItem;
  let inventory: IItem;
  let inventoryContainer: IItemContainer;
  let sendEventToUserMock: jest.SpyInstance;
  let sendErrorMessageToCharacter: jest.SpyInstance;
  let executeEffectMock: jest.SpyInstance;
  let onHitTargetMock: jest.SpyInstance;
  let useWithEntityBaseValidationSpy: jest.SpyInstance;
  let useWithEntityTargetValidationSpy: jest.SpyInstance;

  beforeAll(() => {
    useWithEntity = container.get<UseWithEntity>(UseWithEntity);
  });

  const addItemsToInventory = async () => {
    const items = [
      await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.DarkRune),
      await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.DarkRune),
    ];

    item1 = items[1];

    healRune = await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.HealRune);

    await unitTestHelper.addItemsToContainer(inventoryContainer, 6, items);
  };

  const prepareData = async () => {
    testCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });

    targetCharacter = await unitTestHelper.createMockCharacter(null, {
      hasEquipment: true,
      hasInventory: true,
      hasSkills: true,
    });

    await testCharacter.populate("skills").execPopulate();
    await targetCharacter.populate("skills").execPopulate();

    testCharacter.x = 10;
    testCharacter.y = 11;
    await testCharacter.save();

    targetCharacter.x = 11;
    targetCharacter.y = 12;
    await targetCharacter.save();

    testNPC = await unitTestHelper.createMockNPC({ alignment: NPCAlignment.Hostile }, null, NPCMovementType.Stopped);

    testNPC.x = 15;
    testNPC.y = 15;
    await testNPC.save();

    inventory = await testCharacter.inventory;
    inventoryContainer = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

    characterSkills = testCharacter.skills as unknown as ISkill;
    characterSkills.magic.level = itemDarkRune.minMagicLevelRequired!;
    characterSkills.level = 10;
    await characterSkills.save();

    targetCharacterSkills = targetCharacter.skills as unknown as ISkill;
    targetCharacterSkills.level = 10;
    await targetCharacterSkills.save();

    await addItemsToInventory();
  };

  beforeEach(async () => {
    await prepareData();

    executeEffectMock = jest.spyOn(useWithEntity as any, "executeEffect");
    // @ts-ignore
    sendEventToUserMock = jest.spyOn(useWithEntity.useWithEntityValidation.socketMessaging, "sendEventToUser");

    // @ts-ignore
    onHitTargetMock = jest.spyOn(useWithEntity.onTargetHit, "execute");
    onHitTargetMock.mockImplementation();

    // @ts-ignore
    useWithEntityBaseValidationSpy = jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation");

    // @ts-ignore
    useWithEntityTargetValidationSpy = jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("Validation", () => {
    it("should pass validation for target character", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(1);
    });

    it("should properly pass validation if target is self", async () => {
      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(useWithEntityBaseValidationSpy).toBeTruthy();

      expect(useWithEntityTargetValidationSpy).toBeTruthy();
    });

    it("should pass validation for target npc", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(1);
    });

    it("should fail validation if entity id is not passed", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: "",
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target was not found.",
        type: "error",
      });
    });

    it("should fail validation if entity type is wrong (npc for character entity)", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target was not found.",
        type: "error",
      });
    });

    it("should fail validation if entity type is wrong (character for npc entity)", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target was not found.",
        type: "error",
      });
    });

    it("should fail validation if item id is not provided", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: "",
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, item you are trying to use was not found.",
        type: "error",
      });
    });

    it("should fail validation if item id is not correct", async () => {
      executeEffectMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: testCharacter._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, item you are trying to use was not found.",
        type: "error",
      });
    });

    it("should fail validation if item blueprint does not exist", async () => {
      executeEffectMock.mockImplementation();

      const itemName = "Invalid Key Item";
      item1.name = itemName;
      item1.key = "invalid-item-key";
      await item1.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: `Sorry, '${itemName}' cannot be used with target.`,
        type: "error",
      });
    });

    it("should fail validation if item blueprint does not have power", async () => {
      executeEffectMock.mockImplementation();

      const apple = await unitTestHelper.createMockItemFromBlueprint(FoodsBlueprint.Apple);

      await useWithEntity.execute(
        {
          itemId: apple._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: `Sorry, '${apple.name}' cannot be used with target.`,
        type: "error",
      });
    });

    it("should call character validation with success (for caster and target)", async () => {
      executeEffectMock.mockImplementation();

      const hasBasicValidationMock = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation");

      // if hasBasicValidation returns true
      hasBasicValidationMock.mockImplementation();
      hasBasicValidationMock.mockReturnValue(true);

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(1);
      // once for caster once for target
      expect(hasBasicValidationMock).toBeCalledTimes(2);
      expect(hasBasicValidationMock).toHaveBeenNthCalledWith(1, testCharacter);

      expect(hasBasicValidationMock).toHaveBeenNthCalledWith(
        2,
        await Character.findById(targetCharacter._id),
        new Map([
          ["not-online", "Sorry, your target is offline."],
          ["banned", "Sorry, your target is banned."],
        ])
      );

      hasBasicValidationMock.mockRestore();
    });

    it("should call character validation for caster with failure", async () => {
      executeEffectMock.mockImplementation();

      const hasBasicValidationMock = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation");

      // if hasBasicValidation returns false;
      hasBasicValidationMock.mockImplementation();
      hasBasicValidationMock.mockReturnValue(false);

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      // is not called for target if caster validation fails
      expect(hasBasicValidationMock).toBeCalledTimes(1);
      expect(hasBasicValidationMock).toHaveBeenLastCalledWith(testCharacter);

      hasBasicValidationMock.mockRestore();
    });

    it("should call character validation for target with failure", async () => {
      executeEffectMock.mockImplementation();

      const hasBasicValidationMock = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation");

      // if hasBasicValidation returns false;
      hasBasicValidationMock.mockImplementation();
      // success for caster but failure for target
      hasBasicValidationMock.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      // once for caster once for target
      expect(hasBasicValidationMock).toBeCalledTimes(2);

      hasBasicValidationMock.mockRestore();
    });

    it("should not call character validation for npc", async () => {
      executeEffectMock.mockImplementation();

      const hasBasicValidationMock = jest.spyOn(CharacterValidation.prototype, "hasBasicValidation");
      hasBasicValidationMock.mockImplementation();
      // fail validation if its called more than once
      hasBasicValidationMock.mockReturnValueOnce(true).mockReturnValueOnce(false);

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(1);
      // once for caster
      expect(hasBasicValidationMock).toBeCalledTimes(1);
    });

    it("should fail validation if target npc is not alive", async () => {
      executeEffectMock.mockImplementation();

      testNPC.health = 0;
      await testNPC.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target is dead.",
        type: "error",
      });
    });

    it("should fail validation if target npc is friendly", async () => {
      executeEffectMock.mockImplementation();

      testNPC.alignment = NPCAlignment.Friendly;
      await testNPC.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target is not valid.",
        type: "error",
      });
    });

    it("should fail validation if target npc is neutral", async () => {
      executeEffectMock.mockImplementation();

      testNPC.alignment = NPCAlignment.Neutral;
      await testNPC.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target is not valid.",
        type: "error",
      });
    });

    it("should fail validation if target is out of reach", async () => {
      executeEffectMock.mockImplementation();

      const isUnderRangeMock = jest.spyOn(MovementHelper.prototype, "isUnderRange");

      testNPC.x = testCharacter.x + (itemDarkRune.useWithMaxDistanceGrid! + 1) * GRID_WIDTH;
      testNPC.y = testCharacter.y;
      await testNPC.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target is out of reach.",
        type: "error",
      });

      expect(isUnderRangeMock).toBeCalledTimes(1);
      expect(isUnderRangeMock).toHaveBeenLastCalledWith(
        testCharacter.x,
        testCharacter.y,
        testNPC.x,
        testNPC.y,
        itemDarkRune.useWithMaxDistanceGrid
      );
    });

    it("should fail if item is not in inventory", async () => {
      executeEffectMock.mockImplementation();

      const isInInventoryMock = jest.spyOn(ItemValidation.prototype, "isItemInCharacterInventory");

      const darkRune = await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.DarkRune);

      await useWithEntity.execute(
        {
          itemId: darkRune._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, the item is not in your inventory.",
        type: "error",
      });

      expect(isInInventoryMock).toBeCalledTimes(1);
      expect(isInInventoryMock).toHaveBeenLastCalledWith(testCharacter, darkRune._id);
    });

    it("should fail validation if character does not have required magic level", async () => {
      executeEffectMock.mockImplementation();

      characterSkills.magic.level = (itemDarkRune.minMagicLevelRequired ?? 0) - 1;
      await characterSkills.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: `Sorry, '${itemDarkRune.name}' can only be used at magic level '${itemDarkRune.minMagicLevelRequired}' or greater.`,
        type: "error",
      });
    });

    it("should fail validation if target is on different scene", async () => {
      executeEffectMock.mockImplementation();

      targetCharacter.scene = testCharacter.scene + "-2";
      await targetCharacter.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(executeEffectMock).toBeCalledTimes(0);
      expect(sendEventToUserMock).toBeCalledTimes(1);

      expect(sendEventToUserMock).toHaveBeenLastCalledWith(testCharacter.channelId, UISocketEvents.ShowMessage, {
        message: "Sorry, your target is not on the same scene.",
        type: "error",
      });
    });
  });

  describe("Item usage", () => {
    it("should successfully use dark rune on target character", async () => {
      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const target = (await Character.findOne({ _id: targetCharacter._id })) as unknown as ICharacter;
      expect(target.health).toBeLessThanOrEqual(83);
      expect(target.mana).toBe(100);
    });

    it("should successfully use poison rune on target character", async () => {
      const items = [await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.PoisonRune)];

      await unitTestHelper.addItemsToContainer(inventoryContainer, 6, items);

      await useWithEntity.execute(
        {
          itemId: items[0]._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const target = (await Character.findOne({ _id: targetCharacter._id })) as unknown as ICharacter;
      expect(target.health).toBeLessThanOrEqual(90);
      expect(target.mana).toBe(100);
    });

    it("should successfully use fire rune on target character", async () => {
      const items = [await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.FireRune)];

      await unitTestHelper.addItemsToContainer(inventoryContainer, 6, items);

      await useWithEntity.execute(
        {
          itemId: items[0]._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const target = (await Character.findOne({ _id: targetCharacter._id })) as unknown as ICharacter;
      expect(target.health).toBeLessThanOrEqual(90);
      expect(target.mana).toBe(100);
    });
    it("should successfully use fire rune on target npc", async () => {
      const items = [await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.FireRune)];

      await unitTestHelper.addItemsToContainer(inventoryContainer, 6, items);

      await useWithEntity.execute(
        {
          itemId: items[0]._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      const target = (await NPC.findOne({ _id: testNPC._id })) as unknown as INPC;
      expect(target.health).toBeLessThanOrEqual(90);
    });
  });

  describe("Side effects & events", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should deal extra damage depending on magic level", async () => {
      characterSkills.magic.level = 12;
      await characterSkills.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const target = (await Character.findOne({ _id: targetCharacter._id })) as unknown as ICharacter;
      expect(target.health).toBeLessThanOrEqual(83);
      expect(target.mana).toBe(100);
    });

    it("should update character weight", async () => {
      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const character = (await Character.findById(testCharacter.id)) as unknown as ICharacter;
      expect(character.weight).toBe(3);
      expect(character.maxWeight).toBe(15);
    });

    it("should receive refresh items event", async () => {
      // @ts-ignore
      sendEventToUserMock = jest.spyOn(useWithEntity.socketMessaging, "sendEventToUser");

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      const inventory = await testCharacter.inventory;
      const container = (await ItemContainer.findById(inventory.itemContainer)) as unknown as IItemContainer;

      expect(sendEventToUserMock).toBeCalled();
      expect(sendEventToUserMock).toHaveBeenCalledWith(
        testCharacter.channelId,
        ItemSocketEvents.EquipmentAndInventoryUpdate,
        {
          inventory: expect.objectContaining({
            _id: container._id,
          }),
          openEquipmentSetOnUpdate: false,
          openInventoryOnUpdate: false,
        }
      );
    });

    it("should receive target character update event", async () => {
      // @ts-ignore
      sendEventToUserMock = jest.spyOn(useWithEntity.socketMessaging, "sendEventToUser");

      testCharacter.channelId = "channel-1";
      await testCharacter.save();

      targetCharacter.channelId = "channel-2";
      await targetCharacter.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(sendEventToUserMock).toBeCalled();

      const character = (await Character.findById(targetCharacter.id)) as unknown as ICharacter;
      const payload = {
        targetId: character._id,
        health: character.health,
        mana: character.mana,
        speed: character.speed,
      };

      // for caster
      expect(sendEventToUserMock).toHaveBeenCalledWith(
        testCharacter.channelId,
        CharacterSocketEvents.AttributeChanged,
        payload
      );

      // for target
      expect(sendEventToUserMock).toHaveBeenCalledWith(
        targetCharacter.channelId,
        CharacterSocketEvents.AttributeChanged,
        payload
      );
    });

    it("should receive projectile animation event", async () => {
      // @ts-ignore
      const sendAnimationEventsSpy = jest.spyOn(useWithEntity, "sendAnimationEvents");

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(sendAnimationEventsSpy).toBeCalledTimes(1);

      expect(sendAnimationEventsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: testCharacter._id,
        }),
        expect.objectContaining({
          _id: targetCharacter._id,
        }),
        expect.objectContaining({
          animationKey: itemDarkRune.animationKey,
        })
      );
    });

    it("should call skill increase functionality to increase target skills", async () => {
      const increaseSPMock = jest.spyOn(SkillIncrease.prototype, "increaseMagicResistanceSP");
      increaseSPMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(increaseSPMock).toHaveBeenCalledTimes(1);

      const skillUpdateEventParams = increaseSPMock.mock.calls[0];

      expect(skillUpdateEventParams[0]).toBeDefined();
      expect(skillUpdateEventParams[0]._id).toStrictEqual(targetCharacter._id);
      expect(skillUpdateEventParams[1]).toBe(itemDarkRune.power);

      increaseSPMock.mockRestore();
    });

    it("should not call skill increase functionality for target npc", async () => {
      const increaseSPMock = jest.spyOn(SkillIncrease.prototype, "increaseMagicResistanceSP");
      increaseSPMock.mockImplementation();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: testNPC._id,
          entityType: EntityType.NPC,
        },
        testCharacter
      );

      expect(increaseSPMock).toHaveBeenCalledTimes(0);

      increaseSPMock.mockRestore();
    });

    it("should increase skills and send skills update event", async () => {
      // @ts-ignore
      const magicResistSkillMock = jest.spyOn(useWithEntity.skillIncrease, "increaseMagicResistanceSP");

      // @ts-ignore
      sendEventToUserMock = jest.spyOn(useWithEntity.socketMessaging, "sendEventToUser");

      testCharacter.channelId = "channel-1";
      await testCharacter.save();

      targetCharacter.channelId = "channel-2";
      await targetCharacter.save();

      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      // use jest to mock itemDarkRune.power property
      // @ts-ignore
      itemDarkRune.power = MagicPower.High;

      expect(magicResistSkillMock).toHaveBeenCalledTimes(1);
    });

    it("should execute hit post processing", async () => {
      await useWithEntity.execute(
        {
          itemId: item1._id,
          entityId: targetCharacter._id,
          entityType: EntityType.Character,
        },
        testCharacter
      );

      expect(onHitTargetMock).toBeCalled();
    });
  });

  describe("Execute method ", () => {
    let useWithEntity: UseWithEntity;
    let testCharacter: ICharacter;
    let testNPC: INPC;
    let testItem: IItem;
    let testRefillItem: IItem;
    let testScytheItem: IItem;
    let testItemBlueprint: IUseWithItemSource;
    let testMockItemBlueprint: any;

    beforeAll(() => {
      useWithEntity = container.get(UseWithEntity);
    });

    beforeEach(async () => {
      testCharacter = await unitTestHelper.createMockCharacter(null, {
        hasSkills: true,
        hasEquipment: true,
      });
      testNPC = await unitTestHelper.createMockNPC();

      testItem = await unitTestHelper.createMockItemFromBlueprint(MagicsBlueprint.HealRune);

      testRefillItem = await unitTestHelper.createMockItemFromBlueprint(ToolsBlueprint.WateringCan);

      testScytheItem = await unitTestHelper.createMockItemFromBlueprint(ToolsBlueprint.Scythe);

      testItemBlueprint = await blueprintManager.getBlueprint<IUseWithItemSource>("items", testItem.baseKey);

      // @ts-ignore
      sendErrorMessageToCharacter = jest.spyOn(useWithEntity.socketMessaging, "sendErrorMessageToCharacter");

      testMockItemBlueprint = {
        usableEffect: jest.fn().mockResolvedValue({}),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it("returns early if base request validation fails", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(false);

      // @ts-ignore
      const validateTargetRequest = jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest");

      testCharacter.isOnline = false;

      const payload = { entityId: testCharacter._id, itemId: testItem._id, entityType: EntityType.Character };

      await useWithEntity.execute(payload, testCharacter);

      expect(validateTargetRequest).not.toHaveBeenCalled();
    });

    it("executes effect on self when blueprint has self auto-target", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      const selfTargetingBlueprint = { ...testItemBlueprint, hasSelfAutoTarget: true } as IUseWithItemSource;
      jest
        // @ts-ignore
        .spyOn(useWithEntity.blueprintManager, "getBlueprint")
        .mockResolvedValueOnce(selfTargetingBlueprint as never);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testCharacter._id, itemId: testItem._id, entityType: EntityType.Character };

      await useWithEntity.execute(payload, testCharacter);

      expect(executeEffectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: testCharacter._id,
        }),
        expect.objectContaining({
          _id: testCharacter._id,
        }),
        expect.anything()
      );
    });

    it("returns early if target request validation fails", async () => {
      testItemBlueprint.hasSelfAutoTarget = false;

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest").mockResolvedValueOnce(false);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testNPC._id, itemId: testItem._id, entityType: EntityType.NPC };

      await useWithEntity.execute(payload, testCharacter);

      // @ts-ignore
      expect(executeEffectSpy).not.toHaveBeenCalled();
    });

    it("executes effect with valid target", async () => {
      testItemBlueprint.hasSelfAutoTarget = false;

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "baseValidation").mockReturnValueOnce(true);

      // @ts-ignore
      jest.spyOn(useWithEntity.useWithEntityValidation, "validateTargetRequest").mockResolvedValueOnce(true);

      // @ts-ignore
      const executeEffectSpy = jest.spyOn(useWithEntity, "executeEffect");

      const payload = { entityId: testNPC._id, itemId: testItem._id, entityType: EntityType.NPC };

      await useWithEntity.execute(payload, testCharacter);

      expect(executeEffectSpy).toHaveBeenCalled();
    });

    it("should execute usableEffect if item is refillable and entity type is item", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(testMockItemBlueprint);

      const payload = { entityId: testItem._id, itemId: testRefillItem._id, entityType: EntityType.Item };

      await useWithEntity.execute(payload, testCharacter);
      expect(testMockItemBlueprint.usableEffect).toHaveBeenCalled();
    });

    it("should not execute usableEffect if item is refillable and entity type is NPC", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(testMockItemBlueprint);

      const payload = { entityId: testItem._id, itemId: testRefillItem._id, entityType: EntityType.NPC };

      await useWithEntity.execute(payload, testCharacter);
      expect(testMockItemBlueprint.usableEffect).not.toHaveBeenCalled();
    });

    it("should not execute usableEffect if blueprint is not found", async () => {
      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(undefined);
      const payload = { entityId: testItem._id, itemId: testRefillItem._id, entityType: EntityType.Item };

      await useWithEntity.execute(payload, testCharacter);

      expect(sendErrorMessageToCharacter).toBeCalledWith(
        testCharacter,
        "Refill blueprint is not found or usableEffect is not defined"
      );
    });

    it("should not execute if target is not found", async () => {
      const objectId = new mongoose.Types.ObjectId();

      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(testMockItemBlueprint);

      const payload = { entityId: objectId as string, itemId: testRefillItem._id, entityType: EntityType.Item };

      await useWithEntity.execute(payload, testCharacter);

      expect(sendErrorMessageToCharacter).toBeCalledWith(testCharacter, "Target item is not found");
    });

    it("should execute usableEffect if item key is scythe", async () => {
      testMockItemBlueprint.key = ToolsBlueprint.Scythe;
      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(testMockItemBlueprint);

      const payload = { entityId: testItem._id, itemId: testScytheItem._id, entityType: EntityType.Item };

      await useWithEntity.execute(payload, testCharacter);
      expect(testMockItemBlueprint.usableEffect).toHaveBeenCalled();
    });

    it("should not execute usableEffect if item key is not scythe", async () => {
      testMockItemBlueprint.key = "any-key";
      // @ts-ignore
      jest.spyOn(useWithEntity.blueprintManager, "getBlueprint").mockResolvedValueOnce(testMockItemBlueprint);

      const payload = { entityId: testItem._id, itemId: testScytheItem._id, entityType: EntityType.Item };

      await useWithEntity.execute(payload, testCharacter);
      expect(testMockItemBlueprint.usableEffect).not.toHaveBeenCalled();
    });
  });
});
