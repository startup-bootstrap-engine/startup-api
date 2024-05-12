import { NewRelic } from "@providers/analytics/NewRelic";
import { BlueprintManager } from "@providers/blueprint/BlueprintManager";
import { CharacterConnection } from "@providers/character/CharacterConnection";

import { CharacterBuffActivator } from "@providers/character/characterBuff/CharacterBuffActivator";
import { CharacterBaseSpeed } from "@providers/character/characterMovement/CharacterBaseSpeed";
import { ContainerSlotsCaching } from "@providers/container/ContainerSlotsCaching";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { InMemoryRepository } from "@providers/database/InMemoryRepository";
import { RedisManager } from "@providers/database/RedisManager";
import { EntityEffectUse } from "@providers/entityEffects/EntityEffectUse";
import { EquipmentSlots } from "@providers/equipment/EquipmentSlots";
import { HashGenerator } from "@providers/hash/HashGenerator";
import { Locker } from "@providers/locks/Locker";
import { MapLoader } from "@providers/map/MapLoader";
import { NPCExperience } from "@providers/npc/NPCExperience/NPCExperience";
import { NPCLoader } from "@providers/npc/NPCLoader";
import { NPCManager } from "@providers/npc/NPCManager";
import { BullBoardMonitor } from "@providers/queue/BullBoardMonitor";
import { PM2Helper } from "@providers/server/PM2Helper";
import { ServerBootstrap } from "@providers/server/ServerBootstrap";
import { SkillIncrease } from "@providers/skill/SkillIncrease";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import { SocketEventsBinder } from "@providers/sockets/SocketEventsBinder";
import { SocketEventsBinderControl } from "@providers/sockets/SocketEventsBinderControl";
import { SpellLearn } from "@providers/spells/SpellLearn";
import { SpellCalculator } from "@providers/spells/data/abstractions/SpellCalculator";
import { UnitTestHelper } from "@providers/unitTests/UnitTestHelper";
import { Container } from "inversify";
import { autoProvide, buildProviderModule } from "inversify-binding-decorators";
import { Cronjob } from "../cronjobs/CronJobs";
import { Seeder } from "../seeds/Seeder";
import { Database } from "../server/Database";
import { ServerHelper } from "../server/ServerHelper";
import {
  abTestsControllerContainer,
  blueprintControllerContainer,
  dbTasksControllerContainer,
  formControllerContainer,
  useCasesControllers,
  userControllerContainer,
} from "./ControllersInversify";

const container = new Container();

container.load(
  buildProviderModule(),
  userControllerContainer,
  dbTasksControllerContainer,
  abTestsControllerContainer,
  formControllerContainer,
  useCasesControllers,
  blueprintControllerContainer
);

autoProvide(container);

export const database = container.get<Database>(Database);
export const cronJobs = container.get<Cronjob>(Cronjob);
export const seeds = container.get<Seeder>(Seeder);
export const serverHelper = container.get<ServerHelper>(ServerHelper);
export const socketAdapter = container.get<SocketAdapter>(SocketAdapter);

export const mapLoader = container.get<MapLoader>(MapLoader);
export const npcManager = container.get<NPCManager>(NPCManager);
export const npcMetaDataLoader = container.get<NPCLoader>(NPCLoader);
export const unitTestHelper = container.get<UnitTestHelper>(UnitTestHelper);
export const socketEventsBinder = container.get<SocketEventsBinder>(SocketEventsBinder);

export const socketEventsBinderControl = container.get<SocketEventsBinderControl>(SocketEventsBinderControl);

export const characterConnection = container.get<CharacterConnection>(CharacterConnection);

export const redisManager = container.get<RedisManager>(RedisManager);

export const inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);

export const inMemoryRepository = container.get<InMemoryRepository>(InMemoryRepository);

export const bullBoardMonitor = container.get<BullBoardMonitor>(BullBoardMonitor);

export const pm2Helper = container.get<PM2Helper>(PM2Helper);

export const spellCalculator = container.get<SpellCalculator>(SpellCalculator);

export const characterBuffActivator = container.get<CharacterBuffActivator>(CharacterBuffActivator);

export const skillIncrease = container.get<SkillIncrease>(SkillIncrease);

export const serverBootstrap = container.get<ServerBootstrap>(ServerBootstrap);

export const newRelic = container.get<NewRelic>(NewRelic);

export const spellLearn = container.get<SpellLearn>(SpellLearn);

export const npcExperience = container.get<NPCExperience>(NPCExperience);

export const entityEffectUse = container.get<EntityEffectUse>(EntityEffectUse);

export const equipmentSlots = container.get<EquipmentSlots>(EquipmentSlots);

export const blueprintManager = container.get<BlueprintManager>(BlueprintManager);

export const containerSlotsCaching = container.get<ContainerSlotsCaching>(ContainerSlotsCaching);

export const hashGenerator = container.get<HashGenerator>(HashGenerator);

export const locker = container.get<Locker>(Locker);

export const blueprint = container.get<BlueprintManager>(BlueprintManager);

export const characterBaseSpeed = container.get<CharacterBaseSpeed>(CharacterBaseSpeed);

export { container };
