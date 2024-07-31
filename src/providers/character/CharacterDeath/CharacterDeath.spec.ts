/* eslint-disable no-unused-vars */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC } from "@entities/ModuleNPC/NPCModel";
import { DROP_EQUIPMENT_CHANCE } from "@providers/constants/DeathConstants";
import { DiscordBot } from "@providers/discord/DiscordBot";
import { container, unitTestHelper } from "@providers/inversify/container";
import { SocketMessaging } from "@providers/sockets/SocketMessaging";
import { BattleSocketEvents, EntityAttackType, IBattleDeath, Modes } from "@rpg-engine/shared";
import _ from "lodash";
import { CharacterDeathCalculator } from "../CharacterDeathCalculator";
import { CharacterRespawn } from "../CharacterRespawn";
import { CharacterWeapon } from "../CharacterWeapon";
import { CharacterDeath } from "./CharacterDeath";
import { CharacterDeathPenalties } from "./CharacterDeathPenalties";

jest.mock("@providers/constants/DeathConstants", () => ({
  DROP_EQUIPMENT_CHANCE: 15,
}));

describe("CharacterDeath.ts", () => {
  let characterDeath: CharacterDeath;
  let testCharacter: ICharacter;
  let testNPC: INPC;

  beforeAll(() => {
    characterDeath = container.get<CharacterDeath>(CharacterDeath);
  });

  describe("Event Dispatching", () => {
    let socketMessaging: SocketMessaging;

    beforeEach(async () => {
      socketMessaging = container.get<SocketMessaging>(SocketMessaging);
      testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });
    });

    it("should send battle death events", async () => {
      const spySendEventToUser = jest.spyOn(SocketMessaging.prototype, "sendEventToUser");
      const spySendEventToCharactersAroundCharacter = jest.spyOn(
        SocketMessaging.prototype,
        "sendEventToCharactersAroundCharacter"
      );

      // @ts-ignore
      await characterDeath.sendBattleDeathEvents(testCharacter);

      const expectedBattleDeathData: IBattleDeath = {
        id: testCharacter._id,
        type: "Character",
      };

      expect(spySendEventToUser).toHaveBeenCalledWith(
        testCharacter.channelId,
        BattleSocketEvents.BattleDeath,
        expectedBattleDeathData
      );

      expect(spySendEventToCharactersAroundCharacter).toHaveBeenCalledWith(
        testCharacter,
        BattleSocketEvents.BattleDeath,
        expectedBattleDeathData
      );
    });
  });

  describe("Character Respawn", () => {
    let characterRespawn: CharacterRespawn;

    beforeEach(async () => {
      characterRespawn = container.get<CharacterRespawn>(CharacterRespawn);
      testCharacter = await unitTestHelper.createMockCharacter(null, { hasEquipment: true });
    });

    it("should respawn character after death", async () => {
      const spyRespawnCharacter = jest.spyOn(CharacterRespawn.prototype, "respawnCharacter");

      await characterDeath.handleCharacterDeath(null, testCharacter);

      expect(spyRespawnCharacter).toHaveBeenCalledWith(testCharacter);
    });
  });

  describe("Killer Handling", () => {
    beforeEach(async () => {
      testCharacter = await unitTestHelper.createMockCharacter();
      testNPC = await unitTestHelper.createMockNPC();
    });

    it("should handle killer actions after killing a character", async () => {
      const spyClearAttackerTarget = jest.spyOn(CharacterDeath.prototype as any, "clearAttackerTarget");
      const spySendDiscordPVPMessage = jest.spyOn(CharacterDeath.prototype as any, "sendDiscordPVPMessage");
      const spyHandleCharacterKiller = jest.spyOn(CharacterDeath.prototype as any, "handleCharacterKiller");

      // @ts-ignore
      await characterDeath.handleKiller(testNPC, testCharacter);

      expect(spyClearAttackerTarget).toHaveBeenCalledWith(testNPC);
      expect(spySendDiscordPVPMessage).not.toHaveBeenCalled();
      expect(spyHandleCharacterKiller).not.toHaveBeenCalled();
    });

    it("should send Discord PVP message and handle character killer when killer is a character", async () => {
      const killerCharacter = await unitTestHelper.createMockCharacter();
      const spySendDiscordPVPMessage = jest.spyOn(CharacterDeath.prototype as any, "sendDiscordPVPMessage");
      const spyHandleCharacterKiller = jest.spyOn(CharacterDeath.prototype as any, "handleCharacterKiller");

      // @ts-ignore
      await characterDeath.handleKiller(killerCharacter, testCharacter);

      expect(spySendDiscordPVPMessage).toHaveBeenCalledWith(killerCharacter, testCharacter);
      expect(spyHandleCharacterKiller).toHaveBeenCalledWith(killerCharacter, testCharacter);
    });
  });

  describe("Notification Handling", () => {
    let discordBot: DiscordBot;

    beforeEach(async () => {
      discordBot = container.get<DiscordBot>(DiscordBot);
      testCharacter = await unitTestHelper.createMockCharacter();
    });

    it("should send PVP death message to Discord", async () => {
      const killerCharacter = await unitTestHelper.createMockCharacter();
      const spySendMessage = jest.spyOn(DiscordBot.prototype, "sendMessage");

      // @ts-ignore
      await characterDeath.sendDiscordPVPMessage(killerCharacter, testCharacter);

      expect(spySendMessage).toHaveBeenCalled();
    });
  });

  describe("Character loot drop", () => {
    let testCharacter: ICharacter;
    let backpackContainer: IItemContainer;
    let characterEquipment: IEquipment;
    let testNPC: INPC;
    let characterWeapon: CharacterWeapon;

    beforeAll(() => {
      characterWeapon = container.get<CharacterWeapon>(CharacterWeapon);

      // @ts-ignore
      jest.spyOn(CharacterDeathCalculator.prototype, "calculateInventoryDropChance").mockImplementation(() => 100);
    });

    beforeEach(async () => {
      testNPC = await unitTestHelper.createMockNPC();
      testCharacter = await unitTestHelper.createMockCharacter(
        {
          mode: Modes.HardcoreMode,
        },
        {
          hasEquipment: true,
          hasInventory: true,
          hasSkills: true,
        }
      );

      characterEquipment = (await Equipment.findById(testCharacter.equipment)
        .populate("inventory")
        .exec()) as IEquipment;

      // Add items to character's equipment
      const equipment = await unitTestHelper.createEquipment();
      characterEquipment.head = equipment.neck;
      characterEquipment.neck = equipment.head;
      characterEquipment.leftHand = equipment.leftHand;
      await characterEquipment.save();

      // Add items to character's backpack
      const backpack = characterEquipment.inventory as unknown as IItem;
      backpackContainer = await unitTestHelper.createMockBackpackItemContainer(backpack, {
        owner: testCharacter._id,
        carrier: testCharacter._id,
      });

      await Item.updateOne(
        {
          _id: backpack._id,
        },
        {
          $set: {
            itemContainer: backpackContainer._id,
          },
        }
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should drop character's backpack items as a container on its dead body, clear items properly", async () => {
      // @ts-ignore
      const spyDropCharacterItemsOnBody = jest.spyOn(CharacterDeathPenalties.prototype, "dropCharacterItemsOnBody");

      // initially, character's backpack has 2 items
      expect(backpackContainer?.slots[0]).not.toBeNull();
      expect(backpackContainer?.slots[1]).not.toBeNull();

      // character dies
      await characterDeath.handleCharacterDeath(testNPC, testCharacter);

      expect(spyDropCharacterItemsOnBody).toHaveBeenCalled();

      const characterBody = await Item.findOne({
        name: `${testCharacter.name}'s body`,
        scene: testCharacter.scene,
      })
        .populate("itemContainer")
        .exec();

      const bodyItemContainer = characterBody!.itemContainer as unknown as IItemContainer;

      expect(characterBody).not.toBeNull();

      // body should have the only one item
      expect(characterBody!.itemContainer).toBeDefined();
      expect(bodyItemContainer.slots).toBeDefined();

      const hasBackpack = Object.values(bodyItemContainer.slots).some((slot: IItem) => slot.key === "backpack");

      expect(hasBackpack).toBeTruthy();

      const updatedBody = await Item.findById(characterBody!._id).lean();

      expect(updatedBody?.owner).toBeUndefined();

      expect(updatedBody?.isDeadBodyLootable).toBe(true);

      const droppedBackpack = bodyItemContainer.slots[0] as unknown as IItem;

      const updatedBackpackContainer = await ItemContainer.findById(droppedBackpack.itemContainer).lean();

      const droppedItem1 = await Item.findById(updatedBackpackContainer?.slots?.[0]._id).lean();
      const droppedItem2 = await Item.findById(updatedBackpackContainer?.slots?.[1]._id).lean();
      const droppedBPItem = await Item.findById(droppedBackpack?._id).lean();

      expect(droppedItem1?.owner).toBeUndefined();
      expect(droppedItem2?.owner).toBeUndefined();
      expect(droppedBPItem?.owner).toBeUndefined();
    });

    it("should drop equipment item on character's dead body", async () => {
      // @ts-ignore
      const characterBody = (await characterDeath.generateCharacterBody(testCharacter)) as IItem;

      let bodyItemContainer = (await ItemContainer.findById(characterBody.itemContainer)) as unknown as IItemContainer;

      // character is equipped with 2 items (head and neck)
      expect(characterEquipment.neck).toBeDefined();
      expect(characterEquipment.head).toBeDefined();
      // call 3 times the dropEquippedItemOnBody with 100% chance
      // of dropping the items to drop both of them
      // and make one extra call that should not add anything to the body container
      for (let i = 0; i < 3; i++) {
        // mock lodash random to always return 100
        jest.spyOn(_, "random").mockImplementation(() => DROP_EQUIPMENT_CHANCE);

        // @ts-ignore
        await characterDeath.characterDeathPenalties.dropEquippedItemOnBody(
          testCharacter,
          bodyItemContainer as any,
          characterEquipment
        );
      }

      const updatedEquipment = (await Equipment.findById(characterEquipment._id)) as IEquipment;

      // character equipment is empty
      expect(updatedEquipment.neck).toBeFalsy();
      expect(updatedEquipment.head).toBeFalsy();

      bodyItemContainer = (await ItemContainer.findById(characterBody.itemContainer)) as unknown as IItemContainer;

      // dead body contains the items
      expect(bodyItemContainer!.slots).toBeDefined();
      expect(bodyItemContainer!.slots[0]).not.toBeNull();
      expect(bodyItemContainer!.slots[1]).not.toBeNull();
      expect(bodyItemContainer!.slots[2]).not.toBeNull();

      const updatedBody = await Item.findById(characterBody._id);
      expect(updatedBody?.isDeadBodyLootable).toBe(true);
    });

    it("should update the attack type after dead and drop Bow, Ranged to Melee", async () => {
      // @ts-ignore
      const characterBody = (await characterDeath.generateCharacterBody(testCharacter)) as IItem;
      const bodyItemContainer = (await ItemContainer.findById(
        characterBody.itemContainer
      )) as unknown as IItemContainer;

      expect(characterEquipment.leftHand).toBeDefined();

      const characterAttackTypeBeforeEquip = await Character.findById({ _id: testCharacter._id });

      if (!characterAttackTypeBeforeEquip) throw new Error("Character not found");

      const attackType = await characterWeapon.getAttackType(characterAttackTypeBeforeEquip);

      expect(attackType).toEqual(EntityAttackType.Ranged);

      let characterDropItem;

      for (let i = 0; i < 3; i++) {
        jest.spyOn(_, "random").mockImplementation(() => DROP_EQUIPMENT_CHANCE);
        // @ts-ignore
        // eslint-disable-next-line no-unused-vars
        characterDropItem = await characterDeath.characterDeathPenalties.dropEquippedItemOnBody(
          testCharacter,
          bodyItemContainer as any,
          characterEquipment
        );
      }

      if (characterDropItem) {
        const updatedEquipment = (await Equipment.findById(characterEquipment._id)) as IEquipment;

        expect(updatedEquipment.leftHand).not.toBeDefined();

        const characterAttackTypeAfterEquip = await Character.findById({ _id: testCharacter._id });

        if (!characterAttackTypeAfterEquip) throw new Error("Character not found");

        const attackTypeAfterEquip = await characterWeapon.getAttackType(characterAttackTypeAfterEquip);

        expect(attackTypeAfterEquip).toEqual(EntityAttackType.Melee);
      }
    });
  });
});
