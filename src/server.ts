import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "express-async-errors";
import "reflect-metadata";

import { appEnv } from "@providers/config/env";
import {
  bullBoardMonitor,
  container,
  cronJobs,
  database,
  inMemoryHashTable,
  inMemoryRepository,
  mapLoader,
  messagingBroker,
  messagingBrokerHandlers,
  newRelic,
  redisManager,
  redisPubSubListeners,
  redisStreams,
  redisStreamsListeners,
  serverBootstrap,
  serverHelper,
  socketAdapter,
} from "@providers/inversify/container";
import { errorHandlerMiddleware } from "@providers/middlewares/ErrorHandlerMiddleware";
import { RedisPubSub } from "@providers/redis/RedisPubSub";
import { router } from "@providers/server/Router";
import { app } from "@providers/server/app";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { EnvType } from "@rpg-engine/shared/dist";
import { unassignedItemChecker } from "scripts/unassignedItemChecker";

dayjs.extend(duration);

// Load New Relic if not running unit tests
if (!appEnv.general.IS_UNIT_TEST) {
  require("@rpg-engine/newrelic");
}

// Determine the port to use
const port = getPort();

// Start the server
app.listen(port, async () => {
  const startTime = dayjs();

  await newRelic.trackTransaction(
    NewRelicTransactionCategory.Operation,
    "ServerBootstrap",
    async () => {
      await initializeServerComponents();
      logStartupMessage(startTime, port);
    },
    appEnv.general.ENV === EnvType.Development
  );
});

/**
 * Determine the appropriate port for the server to listen on.
 * @returns {number} The port number.
 */
function getPort(): number {
  if (appEnv.general.MICROSERVICE_NAME === "rpg-npc") {
    return 5005;
  }
  return Number(appEnv.general.SERVER_PORT) || 3002;
}

/**
 * Initialize all necessary server components and middleware.
 */
async function initializeServerComponents(): Promise<void> {
  const { IS_MICROSERVICE } = appEnv.general;

  const redisPubSub = container.get(RedisPubSub);

  await Promise.all([database.initialize(), redisManager.connect()]);

  await socketAdapter.init(appEnv.socket.type);

  await messagingBrokerHandlers.onAddHandlers();
  await redisPubSub.init();
  await redisStreams.init();

  await redisPubSubListeners.addSubscribers();
  await redisStreamsListeners.addSubscribers();
  await messagingBroker.initialize();

  await inMemoryHashTable.init();
  await inMemoryRepository.init();

  await bullBoardMonitor.init();

  !IS_MICROSERVICE && cronJobs.start(); // only schedule on rpg-api

  await mapLoader.init(); // must be the first thing loaded!

  if (appEnv.general.ENV === EnvType.Development && appEnv.general.DEBUG_MODE === true) {
    unassignedItemChecker();
  }

  app.use(router);
  app.use(errorHandlerMiddleware);
  app.use("/admin/queues", bullBoardMonitor.getRouter());

  await serverBootstrap.performOneTimeOperations();
  await serverBootstrap.performMultipleInstancesOperations();

  if (appEnv.general.ENV === EnvType.Production) {
    console.log(`✅ Application started successfully on PMID ${process.env.pm_id}`);
  }
}

/**
 * Logs a message indicating the server's successful startup.
 * @param {dayjs.Dayjs} startTime - The start time of the server bootstrap process
 */
function logStartupMessage(startTime: dayjs.Dayjs, port: number): void {
  const endTime = dayjs();
  const startupTime = dayjs.duration(endTime.diff(startTime)).asMilliseconds();

  serverHelper.showBootstrapMessage(
    {
      appName: appEnv.general.APP_NAME!,
      port,
      timezone: appEnv.general.TIMEZONE!,
      adminEmail: appEnv.general.ADMIN_EMAIL!,
      language: appEnv.general.LANGUAGE!,
      phoneLocale: appEnv.general.PHONE_LOCALE!,
      startupTime,
    },
    process.env.MICROSERVICE_NAME
  );
}
