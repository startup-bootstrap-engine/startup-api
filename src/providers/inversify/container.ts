import { NewRelic } from "@providers/analytics/NewRelic";
import { DatabaseFactory } from "@providers/database/adapters/DatabaseFactory";
import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RedisManager } from "@providers/database/RedisManager";
import { RepositoryFactory } from "@providers/database/repository/RepositoryFactory";
import { HashGenerator } from "@providers/hash/HashGenerator";
import { Locker } from "@providers/locks/Locker";
import { LinearInterpolation } from "@providers/math/LinearInterpolation";
import { MathHelper } from "@providers/math/MathHelper";
import { MessagingBrokerHandlers } from "@providers/microservice/messaging-broker/MessagingBrokerHandlers";
import { MessagingBroker } from "@providers/microservice/messaging-broker/MessagingBrokerMessaging";
import { BullBoardMonitor } from "@providers/queue/BullBoardMonitor";
import { EntityQueueScalingCalculator } from "@providers/queue/EntityQueueScalingCalculator";
import { RabbitMQ } from "@providers/rabbitmq/RabbitMQ";
import { RedisPubSubListeners } from "@providers/redis/RedisPubSubListeners";
import { RedisStreams } from "@providers/redis/RedisStreams";
import { RedisStreamsListeners } from "@providers/redis/RedisStreamsListeners";
import { PM2Helper } from "@providers/server/PM2Helper";
import { ServerBootstrap } from "@providers/server/ServerBootstrap";
import { SocketAdapter } from "@providers/sockets/SocketAdapter";
import { SocketEventsBinder } from "@providers/sockets/SocketEventsBinder";
import { SocketEventsBinderControl } from "@providers/sockets/SocketEventsBinderControl";
import { IntegrationTestMocker } from "@providers/tests/IntegrationMocker";
import { UnitTestMocker } from "@providers/tests/UnitTestMocker";
import { NumberFormatter } from "@providers/text/NumberFormatter";
import { TextFormatter } from "@providers/text/TextFormatter";
import { Container } from "inversify";
import { autoProvide, buildProviderModule } from "inversify-binding-decorators";
import { Cronjob } from "../cronjobs/CronJobs";
import { Seeder } from "../seeds/Seeder";
import { ServerHelper } from "../server/ServerHelper";
import {
  abTestsControllerContainer,
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
  useCasesControllers
);

autoProvide(container);

export const rabbitMQ = container.get<RabbitMQ>(RabbitMQ);
export const messagingBroker = container.get<MessagingBroker>(MessagingBroker);
export const messagingBrokerHandlers = container.get<MessagingBrokerHandlers>(MessagingBrokerHandlers);
export const redisPubSubListeners = container.get<RedisPubSubListeners>(RedisPubSubListeners);
export const redisStreamsListeners = container.get<RedisStreamsListeners>(RedisStreamsListeners);
export const redisStreams = container.get<RedisStreams>(RedisStreams);
export const databaseFactory = container.get<DatabaseFactory>(DatabaseFactory);
export const cronJobs = container.get<Cronjob>(Cronjob);
export const seeds = container.get<Seeder>(Seeder);
export const serverHelper = container.get<ServerHelper>(ServerHelper);
export const socketAdapter = container.get<SocketAdapter>(SocketAdapter);

export const integrationTestMocker = container.get<IntegrationTestMocker>(IntegrationTestMocker);
export const unitTestMocker = container.get<UnitTestMocker>(UnitTestMocker);

export const socketEventsBinder = container.get<SocketEventsBinder>(SocketEventsBinder);

export const socketEventsBinderControl = container.get<SocketEventsBinderControl>(SocketEventsBinderControl);

export const redisManager = container.get<RedisManager>(RedisManager);

export const inMemoryHashTable = container.get<InMemoryHashTable>(InMemoryHashTable);

export const bullBoardMonitor = container.get<BullBoardMonitor>(BullBoardMonitor);

export const pm2Helper = container.get<PM2Helper>(PM2Helper);

export const serverBootstrap = container.get<ServerBootstrap>(ServerBootstrap);

export const newRelic = container.get<NewRelic>(NewRelic);

export const hashGenerator = container.get<HashGenerator>(HashGenerator);

export const locker = container.get<Locker>(Locker);

export const textFormatter = container.get<TextFormatter>(TextFormatter);

export const entityQueueScalingCalculator = container.get<EntityQueueScalingCalculator>(EntityQueueScalingCalculator);

export const numberFormatter = container.get<NumberFormatter>(NumberFormatter);

export const linearInterpolation = container.get<LinearInterpolation>(LinearInterpolation);

export const mathHelper = container.get<MathHelper>(MathHelper);

export const repositoryFactory = container.get<RepositoryFactory>(RepositoryFactory);
export { container };
