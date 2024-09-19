/* eslint-disable mongoose-lean/require-lean */
import { Character, ICharacter } from "@entities/ModuleCharacter/CharacterModel";
import { CharacterPvPKillLog } from "@entities/ModuleCharacter/CharacterPvPKillLogModel";
import { Equipment, IEquipment } from "@entities/ModuleCharacter/EquipmentModel";
import { Skill } from "@entities/ModuleCharacter/SkillsModel";
import { Depot, IDepot } from "@entities/ModuleDepot/DepotModel";
import { IItemContainer, ItemContainer } from "@entities/ModuleInventory/ItemContainerModel";
import { IItem, Item } from "@entities/ModuleInventory/ItemModel";
import { INPC, NPC } from "@entities/ModuleNPC/NPCModel";
import { IQuest, Quest } from "@entities/ModuleQuest/QuestModel";
import { QuestObjectiveInteraction, QuestObjectiveKill } from "@entities/ModuleQuest/QuestObjectiveModel";
import { QuestReward } from "@entities/ModuleQuest/QuestRewardModel";
import { ChatLog } from "@entities/ModuleSystem/ChatLogModel";
import { IControlTime, MapControlTimeModel } from "@entities/ModuleSystem/MapControlTimeModel";
import { IUser, User } from "@entities/ModuleSystem/UserModel";
import { CharacterInventory } from "@providers/character/CharacterInventory";
import { CharacterSkull } from "@providers/character/CharacterSkull";
import { CharacterItems } from "@providers/character/characterItems/CharacterItems";
import {
  CHARACTER_SKULL_RED_SKULL_DURATION,
  CHARACTER_SKULL_WHITE_SKULL_DURATION,
  CHARACTER_SKULL_YELLOW_SKULL_DURATION,
} from "@providers/constants/CharacterSkullConstants";
import { EquipmentEquip } from "@providers/equipment/EquipmentEquip";
import { blueprintManager, container, mapLoader } from "@providers/inversify/container";
import {
  AvailableBlueprints,
  BodiesBlueprint,
  ContainersBlueprint,
} from "@providers/item/data/types/itemsBlueprintTypes";
import { SocketTransmissionZone } from "@providers/sockets/SocketTransmissionZone";
import {
  fixedPathMockNPC,
  moveAwayMockNPC,
  moveTowardsMockNPC,
  randomMovementMockNPC,
  stoppedMovementMockNPC,
} from "@providers/unitTests/mock/NPCMock";
import { characterMock } from "@providers/unitTests/mock/characterMock";
import {
  CharacterSkullType,
  IQuestObjectiveKill,
  ISocketTransmissionZone,
  NPCMovementType,
  PeriodOfDay,
  QuestType,
  UserAccountTypes,
} from "@rpg-engine/shared";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { chatLogsMock } from "./mock/chatLogsMock";
import {
  itemMeleeRangedMock,
  itemMock,
  itemMockArmor,
  itemMockBow,
  itemMockShield,
  itemTwoHandedMock,
  stackableGoldCoinMock,
  stackableItemMock,
} from "./mock/itemMock";
import {
  questInteractionCraftObjectiveMock,
  questInteractionObjectiveMock,
  questKillObjectiveMock,
  questMock,
  questRewardsMock,
} from "./mock/questMock";

import { GuildChatLog, IGuildChatLog } from "@entities/ModuleSystem/GuildChatLogModel";
import { Guild, IGuild } from "@entities/ModuleSystem/GuildModel";
import { guildChatLogMock } from "./mock/guildChatLogMock";
import { guildMock } from "./mock/guildMock";
import { userMock } from "./mock/userMock";

export enum InteractionQuestSubtype {
  craft = "craft",
}

interface IMockCharacterOptions {
  hasEquipment?: boolean;
  hasInventory?: boolean;
  hasSkills?: boolean;
  isPremiumAccount?: boolean;
  isPremiumAccountType?: UserAccountTypes;
  hasUser?: boolean;
  hasSkull?: CharacterSkullType;
}

interface IMockNPCOptions {
  hasSkills?: boolean;
}

interface IMockQuestOptions {
  type?: QuestType;
  objectivesCount?: number;
  subtype?: InteractionQuestSubtype;
  emptyObjectives?: boolean;
}

@provide(UnitTestHelper)
export class UnitTestHelper {
  private readonly oneMinuteAgo = 60 * 1000;
  constructor(private characterInventory: CharacterInventory, private characterSkull: CharacterSkull) {}

  private mongoServer: MongoMemoryServer;
  private characterItems: CharacterItems;

  public async initializeMapLoader(): Promise<void> {
    jest
      // @ts-ignore
      .spyOn(mapLoader, "getMapNames")
      // @ts-ignore
      .mockImplementation(() => ["unit-test-map.json", "example.json", "unit-test-map-negative-coordinate.json"]);

    await mapLoader.init();
  }

  public async createWeatherControlMock(
    time: string,
    period: PeriodOfDay,
    weather: string,
    createdAt?: Date
  ): Promise<IControlTime> {
    const weatherControl = new MapControlTimeModel({
      time: time,
      period: period,
      weather: weather,
      createdAt: createdAt,
    });
    await weatherControl.save();

    return weatherControl;
  }

  public async createMockHostileNPC(
    creatureName: any,
    options: IMockNPCOptions | null = null,
    movementType: NPCMovementType = NPCMovementType.Random
  ): Promise<INPC> {
    const movementTypeMock = {
      [NPCMovementType.FixedPath]: fixedPathMockNPC,
      [NPCMovementType.MoveAway]: moveAwayMockNPC,
      [NPCMovementType.MoveTowards]: moveTowardsMockNPC,
      [NPCMovementType.Random]: randomMovementMockNPC,
      [NPCMovementType.Stopped]: stoppedMovementMockNPC,
    };
    const creature = new NPC({
      ...movementTypeMock[movementType],
      health: creatureName.baseHealth,
      maxHealth: creatureName.baseHealth,
      name: creatureName.name,
      tier: creatureName.tier,
      subType: creatureName.subType,
      key: creatureName.key,
      textureKey: creatureName.textureKey,
      alignment: creatureName.alignment,
      attackType: creatureName.attackType,
      speed: creatureName.speed,
      baseHealth: creatureName.baseHealth,
      healthRandomizerDice: creatureName.healthRandomizerDice,
      canSwitchToRandomTarget: creatureName.canSwitchToRandomTarget,
      skillRandomizerDice: creatureName.skillRandomizerDice,
      skillsToBeRandomized: creatureName.skillsToBeRandomized,
      fleeOnLowHealth: creatureName.fleeOnLowHealth,
      // loots: creatureName.loots,
      entityEffects: creatureName.entityEffects,
    });

    if (options?.hasSkills) {
      const npcSkills = new Skill({
        ownerType: "NPC",
        ...creatureName.skills,
      });

      npcSkills.owner = creature._id;
      creature.skills = npcSkills._id;
      await npcSkills.save();
    }

    creature.x = 0;
    creature.y = 0;

    await creature.save();

    return creature;
  }

  public async createMockNPC(
    extraProps: Record<string, unknown> | null = null,
    options: IMockNPCOptions | null = null,
    movementType: NPCMovementType = NPCMovementType.Random
  ): Promise<INPC> {
    const movementTypeMock = {
      [NPCMovementType.FixedPath]: fixedPathMockNPC,
      [NPCMovementType.MoveAway]: moveAwayMockNPC,
      [NPCMovementType.MoveTowards]: moveTowardsMockNPC,
      [NPCMovementType.Random]: randomMovementMockNPC,
      [NPCMovementType.Stopped]: stoppedMovementMockNPC,
    };
    const testNPC = new NPC({
      ...movementTypeMock[movementType],
      ...extraProps,
      experience: 100,
      loots: [
        {
          itemBlueprintKey: "cheese",
          chance: 100,
          quantityRange: [1, 2],
        },
      ],
    });

    if (options?.hasSkills) {
      const npcSkills = new Skill({
        ownerType: "NPC",
      });

      npcSkills.owner = testNPC._id;
      testNPC.skills = npcSkills._id;
      await npcSkills.save();
    }

    if (extraProps && "x" in extraProps && "y" in extraProps) {
      testNPC.x = extraProps.x as number;
      testNPC.y = extraProps.y as number;
    } else {
      testNPC.x = 0;
      testNPC.y = 0;
    }

    await testNPC.save();

    return testNPC;
  }

  public async addItemsToContainer(
    container: IItemContainer,
    slotQty: number,
    items: IItem[],
    availableSlots?: number[]
  ): Promise<IItemContainer> {
    container.slotQty = slotQty;

    if (availableSlots && availableSlots.length === items.length) {
      for (const i in availableSlots) {
        const availableSlot = availableSlots[i];
        const item = items[i];
        container.slots[availableSlot] = item.toJSON({ virtuals: true });
      }
    } else {
      const slots = {};
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        slots[i] = item.toJSON({ virtuals: true });
      }

      container.slots = slots;
    }

    container.markModified("slots");
    await container.save();

    return container;
  }

  public async createMockCharacterDeadBody(
    character: ICharacter,
    extraProps?: Record<string, unknown>
  ): Promise<IItem> {
    const blueprintData = await blueprintManager.getBlueprint<IItem>("items", BodiesBlueprint.CharacterBody);

    const charBody = new Item({
      ...blueprintData,
      owner: character._id,
      name: `${character.name}'s body`,
      scene: character.scene,
      x: character.x,
      y: character.y,
      generateContainerSlots: 20,
      isItemContainer: true,
      ...extraProps,
    });

    await charBody.save();

    const item = await Item.findById(charBody._id).populate("itemContainer").exec();

    return item as IItem;
  }

  public async createMockItemFromBlueprint(blueprintKey: string, extraProps?: Partial<IItem>): Promise<IItem> {
    const blueprintData = await blueprintManager.getBlueprint<IItem>("items", blueprintKey as AvailableBlueprints);

    const newItem = new Item({
      ...blueprintData,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createMockItem(extraProps?: Partial<IItem>): Promise<IItem> {
    const newItem = new Item({
      ...itemMock,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createItemBow(extraProps?: Partial<IItem>): Promise<IItem> {
    const itemBow = new Item({
      ...itemMockBow,
      ...extraProps,
      _id: undefined,
    });

    await itemBow.save();

    return itemBow;
  }

  public async createItemMeleeRanged(extraProps?: Partial<IItem>): Promise<IItem> {
    const itemMeleeRanged = new Item({
      ...itemMeleeRangedMock,
      ...extraProps,
      _id: undefined,
    });

    await itemMeleeRanged.save();

    return itemMeleeRanged;
  }

  public async createMockItemTwoHanded(extraProps?: Partial<IItem>): Promise<IItem> {
    const itemTwoHanded = new Item({
      ...itemTwoHandedMock,
      ...extraProps,
    });

    await itemTwoHanded.save();

    return itemTwoHanded;
  }

  public async createMockArmor(extraProps?: Partial<IItem>): Promise<IItem> {
    const newItem = new Item({
      ...itemMockArmor,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createMockShield(extraProps?: Partial<IItem>): Promise<IItem> {
    const newItem = new Item({
      ...itemMockShield,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createStackableMockItem(extraProps?: Partial<IItem>): Promise<IItem> {
    const newItem = new Item({
      ...stackableItemMock,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createGoldCoinMockItem(extraProps?: Partial<IItem>): Promise<IItem> {
    const newItem = new Item({
      ...stackableGoldCoinMock,
      ...extraProps,
    });

    await newItem.save();

    return newItem;
  }

  public async createMockAndEquipItens(character: ICharacter, extraProps?: Partial<IItem>): Promise<void> {
    const itemSword = await this.createMockItem({
      ...extraProps,
    });
    const itemArmor = await this.createMockArmor({
      ...extraProps,
    });
    const equipmentEquip: EquipmentEquip = container.get<EquipmentEquip>(EquipmentEquip);

    const inventory = await this.characterInventory.getInventory(character);

    const inventoryContainer = (await ItemContainer.findById(inventory?.itemContainer)) as unknown as IItemContainer;

    inventoryContainer.slots[0] = itemSword;
    inventoryContainer.slots[1] = itemArmor;
    inventoryContainer.markModified("slots");

    await inventoryContainer.save();

    await equipmentEquip.equip(character, itemSword._id, inventoryContainer.id);

    await equipmentEquip.equip(character, itemArmor._id, inventoryContainer.id);
  }

  public async createMockCharacter(
    extraProps?: Partial<ICharacter> | null,
    options?: IMockCharacterOptions
  ): Promise<ICharacter> {
    const testCharacter = new Character({
      ...characterMock,
      ...extraProps,
    });

    if (options?.hasSkills) {
      const charSkills = new Skill({
        ownerType: "Character",
      });
      charSkills.owner = testCharacter._id;
      testCharacter.skills = charSkills._id;
      await charSkills.save();
    }

    if (options?.hasUser) {
      const user = await this.createMockUser({
        characters: [testCharacter._id],
        email: `premium-user-${uuidv4()}@definya.com`,
      });

      testCharacter.owner = user._id;
    }

    if (options?.isPremiumAccount) {
      const user = await this.createMockUser({
        characters: [testCharacter._id],
        accountType: UserAccountTypes.PremiumGold,
        email: `premium-user-${uuidv4()}@definya.com`,
      });

      testCharacter.owner = user._id;
    }

    if (options?.isPremiumAccountType) {
      const user = await this.createMockUser({
        characters: [testCharacter._id],
        accountType: options.isPremiumAccountType,
        email: `premium-user-${uuidv4()}@definya.com`,
      });

      testCharacter.owner = user._id;
    }

    if (options?.hasEquipment) {
      let equipment;
      if (options?.hasInventory) {
        equipment = await this.addInventoryToCharacter(testCharacter);
      } else {
        equipment = new Equipment();
      }
      await equipment.save();
      testCharacter.equipment = equipment._id;
    }

    if (extraProps && "x" in extraProps && "y" in extraProps) {
      testCharacter.x = extraProps.x as number;
      testCharacter.y = extraProps.y as number;
    } else {
      testCharacter.x = 0;
      testCharacter.y = 0;
    }

    if (options?.hasSkull) {
      testCharacter.hasSkull = true;
      testCharacter.skullType = options?.hasSkull;
      switch (options?.hasSkull) {
        case CharacterSkullType.WhiteSkull:
          testCharacter.skullExpiredAt = dayjs().add(CHARACTER_SKULL_WHITE_SKULL_DURATION, "millisecond").toDate();
          break;
        case CharacterSkullType.YellowSkull:
          testCharacter.skullExpiredAt = dayjs().add(CHARACTER_SKULL_YELLOW_SKULL_DURATION, "millisecond").toDate();
          await this.addUnjustifiedKills(testCharacter, 2);
          break;
        case CharacterSkullType.RedSkull:
          testCharacter.skullExpiredAt = dayjs().add(CHARACTER_SKULL_RED_SKULL_DURATION, "millisecond").toDate();
          await this.addUnjustifiedKills(testCharacter, 4);
          break;
      }
    }

    await testCharacter.save();

    // @ts-ignore
    testCharacter.inventory = await this.characterInventory.getInventory(testCharacter);

    return testCharacter;
  }

  public async addInventoryToCharacter(character: ICharacter): Promise<IEquipment> {
    const characterInventory = container.get<CharacterInventory>(CharacterInventory);

    const equipment = await characterInventory.generateNewInventory(character, ContainersBlueprint.Backpack);

    return equipment;
  }

  public async createMockChatLogs(emitter: ICharacter): Promise<void> {
    for (const chatLogMock of chatLogsMock) {
      chatLogMock.emitter = emitter._id;
      const chatLog = new ChatLog(chatLogMock);
      await chatLog.save();
    }
  }

  public async addUnjustifiedKills(killer: ICharacter, amount: number): Promise<void> {
    const targetId = Types.ObjectId();
    for (let i = 0; i < amount; i++) {
      const characterDeathLog = new CharacterPvPKillLog({
        killer: killer._id.toString(),
        target: targetId.toString(),
        isJustify: false,
        x: 1,
        y: 2,
        createdAt: new Date(Date.now() - amount * this.oneMinuteAgo),
      });

      await characterDeathLog.save();
    }
  }

  public async createEquipment(extraProps?: Partial<IItem>): Promise<IEquipment> {
    const equipment = new Equipment();

    const itemHead = new Item({
      ...itemMock,
      ...extraProps,
      _id: undefined,
      defense: 10,
      attack: 8,
    });

    const itemNeck = new Item({
      ...itemMock,
      ...extraProps,
      _id: undefined,
      defense: 4,
      attack: 5,
    });

    const itemLeftHand = new Item({
      ...itemMockBow,
      ...extraProps,
      _id: undefined,
    });

    await itemHead.save();
    await itemNeck.save();
    await itemLeftHand.save();

    equipment.head = itemHead._id;
    equipment.neck = itemNeck._id;
    equipment.leftHand = itemLeftHand._id;

    return await equipment.save();
  }

  public createMockSocketTransmissionZone(x: number, y: number, width: number, height: number): SocketTransmissionZone {
    const socketTransmissionZone = container.get<SocketTransmissionZone>(SocketTransmissionZone);

    jest.spyOn(socketTransmissionZone, "calculateSocketTransmissionZone").mockImplementation(
      () =>
        ({
          x,
          y,
          width,
          height,
        } as ISocketTransmissionZone)
    );
    return socketTransmissionZone;
  }

  public async createMockItemContainer(extraProps?: Partial<IItemContainer>): Promise<IItemContainer> {
    const parentItem = await this.createMockItemFromBlueprint(ContainersBlueprint.Backpack);

    const itemContainer = new ItemContainer({
      parentItem: parentItem._id,
      ...extraProps,
    });

    await itemContainer.save();

    return itemContainer;
  }

  public async createMockBackpackItemContainer(parent: IItem, extraProps?: Partial<IItem>): Promise<IItemContainer> {
    const slotQty: number = 20;

    const backpackContainer = new ItemContainer({
      name: parent.name,
      parentItem: parent._id,
      owner: parent.owner,
    });

    const weaponItem = new Item({
      ...itemMock,
      ...extraProps,
      defense: 10,
      attack: 8,
    });

    const foodItem = new Item({
      ...stackableItemMock,
      ...extraProps,
    });

    await foodItem.save();
    await weaponItem.save();

    const slots = {};

    for (let i = 0; i < slotQty; i++) {
      slots[Number(i)] = null;
    }

    slots[0] = foodItem;
    slots[1] = weaponItem;

    backpackContainer.slots = slots;

    return backpackContainer.save();
  }

  public async consumeMockItem(
    character: ICharacter,
    inventoryContainer: IItemContainer,
    item: IItem
  ): Promise<boolean> {
    let stackReduced = false;
    if (item.maxStackSize > 1 && item.stackQty && item.stackQty > 1) {
      item.stackQty -= 1;
      await item.save();

      for (let i = 0; i < inventoryContainer.slotQty; i++) {
        const slotItem = inventoryContainer.slots?.[i];
        if (slotItem && slotItem.key === item.key && !stackReduced) {
          inventoryContainer.slots[i].stackQty = item.stackQty;
          stackReduced = true;
        }
      }

      inventoryContainer.markModified("slots");
      await inventoryContainer.save();
    }

    if (!stackReduced && item.stackQty && item.stackQty > 0) {
      await Item.deleteOne({ _id: item._id });

      return false;
    }

    return true;
  }

  public async createMockUser(extraProps?: Partial<IUser>): Promise<IUser> {
    const newUser = new User({
      ...userMock,
      ...extraProps,
    });

    await newUser.save();

    return newUser;
  }

  public async createMockKillQuest(
    npcId: string,
    killCount: number = 1,
    extraProps?: Record<string, unknown>
  ): Promise<IQuest> {
    const baseQuest = await this.createMockQuest(
      npcId,
      {
        type: QuestType.Kill,
        objectivesCount: killCount,
        emptyObjectives: true,
      },
      extraProps
    );

    await this.addQuestKillObjectiveMock(baseQuest, {
      killCountTarget: killCount,
    });

    return baseQuest;
  }

  public async createMockQuest(
    npcId: string,
    options?: IMockQuestOptions | null,
    extraProps?: Record<string, unknown> | null
  ): Promise<IQuest> {
    if (!npcId) {
      throw new Error("need to provide npc id to create a mock quest");
    }

    let testQuestRewards = new QuestReward({
      ...questRewardsMock,
    });
    testQuestRewards = await testQuestRewards.save();

    const testQuest = new Quest({
      ...questMock,
      ...extraProps,
      npcId,
      rewards: [testQuestRewards._id],
      objectives: [],
    });

    if (!options?.emptyObjectives) {
      const objCount = options ? options.objectivesCount || 1 : 1;

      if (options && options.type) {
        switch (options.type) {
          case QuestType.Interaction:
            if (options.subtype === InteractionQuestSubtype.craft) {
              for (let i = 0; i < objCount; i++) {
                await this.addQuestInteractionCraftObjectiveMock(testQuest);
              }
              break;
            }
            for (let i = 0; i < objCount; i++) {
              await this.addQuestInteractionObjectiveMock(testQuest);
            }
            break;

          case QuestType.Kill:
            for (let i = 0; i < objCount; i++) {
              await this.addQuestKillObjectiveMock(testQuest);
            }
            break;
          default:
            throw new Error(`unsupported quest type ${options.type}`);
        }
      } else {
        // by default create 1 objective kill
        for (let i = 0; i < objCount; i++) {
          await this.addQuestKillObjectiveMock(testQuest);
        }
      }
    }

    return testQuest.save();
  }

  private async addQuestInteractionObjectiveMock(quest: IQuest): Promise<void> {
    let testQuestObjectiveInteraction = new QuestObjectiveInteraction({
      ...questInteractionObjectiveMock,
    });
    testQuestObjectiveInteraction = await testQuestObjectiveInteraction.save();
    quest.objectives!.push(testQuestObjectiveInteraction._id);
  }

  private async addQuestInteractionCraftObjectiveMock(quest: IQuest): Promise<void> {
    let testQuestObjectiveInteraction = new QuestObjectiveInteraction({
      ...questInteractionCraftObjectiveMock,
    });
    testQuestObjectiveInteraction = await testQuestObjectiveInteraction.save();
    quest.objectives!.push(testQuestObjectiveInteraction._id);
  }

  public async addQuestKillObjectiveMock(quest: IQuest, overrideProps?: Partial<IQuestObjectiveKill>): Promise<void> {
    let testQuestObjectiveKill = new QuestObjectiveKill({
      ...questKillObjectiveMock,
      ...overrideProps,
    });

    testQuestObjectiveKill = await testQuestObjectiveKill.save();
    quest.objectives!.push(testQuestObjectiveKill._id);

    await quest.save();
  }

  public async createMockDepot(npc: INPC, characterId: string, extraProps?: Partial<IItemContainer>): Promise<IDepot> {
    if (!npc) {
      throw new Error("need to provide npc to create a mock depot");
    }

    if (!characterId) {
      throw new Error("need to provide npc id to create a mock depot");
    }
    let newDepot = new Depot({
      owner: characterId,
      key: npc.key,
    });

    newDepot = await newDepot.save();

    let depotItemContainer = new ItemContainer({
      parentItem: newDepot._id,
      owner: characterId,
      ...extraProps,
    });
    depotItemContainer = await depotItemContainer.save();

    newDepot.itemContainer = depotItemContainer._id;
    newDepot = await newDepot.save();

    return newDepot;
  }

  public async equipItemsInBackpackSlot(
    equipment: IEquipment,
    itemsKeys: string[],
    isItemId: boolean = false,
    extraProps?: Partial<IItem>
  ): Promise<IItem[]> {
    // Add items to character's backpack
    const backpack = equipment.inventory as unknown as IItem;
    const backpackContainer = await this.createMockBackpackItemContainer(backpack);
    backpack.itemContainer = backpackContainer._id;

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

    const items: IItem[] = [];
    if (!isItemId) {
      for (const key of itemsKeys) {
        const item = await this.createMockItemFromBlueprint(key, extraProps);
        const slotId = backpackContainer.firstAvailableSlotId;
        backpackContainer.slots[slotId!] = item._id;
        items.push(item);
      }
    } else {
      for (const id of itemsKeys) {
        const item = (await Item.findById(id)) as unknown as IItem;

        // remove item's coordinates
        item.x = undefined;
        item.y = undefined;
        item.scene = undefined;
        await item.save();

        const slotId = backpackContainer.firstAvailableSlotId;
        backpackContainer.slots[slotId!] = item._id;
        items.push(item);
      }
    }

    backpackContainer.markModified("slots");
    await backpackContainer.save();
    return items;
  }

  /**
   * Helper function to add nested containers
   * @param characterId
   * @param parentContainer
   * @param availableSlot
   * @returns the created nested item container
   */
  async addNestedContainer(
    characterId: Types.ObjectId,
    parentContainer: IItemContainer,
    availableSlot: number
  ): Promise<IItemContainer> {
    const bag = await this.createMockItemFromBlueprint("bag", { owner: characterId });

    const bagCont = await ItemContainer.findById(bag.itemContainer);
    expect(bagCont).toBeDefined();

    await this.addItemsToContainer(parentContainer, 1, [bag], [availableSlot]);

    return bagCont!;
  }

  public async createMockGuild(extraProps?: Partial<IGuild>): Promise<IGuild> {
    const newGuild = new Guild({
      ...guildMock,
      ...extraProps,
    });

    await newGuild.save();

    return newGuild;
  }

  public async createMockGuildChatLog(extraProps?: Partial<IGuildChatLog>): Promise<IGuildChatLog> {
    const newGuildChatLog = new GuildChatLog({
      ...guildChatLogMock,
      ...extraProps,
    });

    await newGuildChatLog.save();

    return newGuildChatLog;
  }
}
