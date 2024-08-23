import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import "express-async-errors";
import "reflect-metadata";

import { appEnv } from "@providers/config/env";
import {
  bullBoardMonitor,
  cronJobs,
  database,
  inMemoryHashTable,
  inMemoryRepository,
  mapLoader,
  newRelic,
  redisManager,
  serverBootstrap,
  serverHelper,
  socketAdapter,
} from "@providers/inversify/container";
import { errorHandlerMiddleware } from "@providers/middlewares/ErrorHandlerMiddleware";
import { router } from "@providers/server/Router";
import { app } from "@providers/server/app";
import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { EnvType } from "@rpg-engine/shared/dist";

dayjs.extend(duration);

// Load New Relic if not running unit tests
if (!appEnv.general.IS_UNIT_TEST) {
  require("newrelic");
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

  await Promise.all([
    database.initialize(),
    redisManager.connect(),
    !IS_MICROSERVICE && socketAdapter.init(appEnv.socket.type), // no need for socket connection in microservices, because we use rpg-api for that only
  ]);

  await inMemoryHashTable.init();
  await inMemoryRepository.init();

  await bullBoardMonitor.init();

  !IS_MICROSERVICE && cronJobs.start(); // only schedule on rpg-api

  await mapLoader.init(); // must be the first thing loaded!

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
 * @param {dayjs.Dayjs} startTime - The start time of the server bootstrap process.
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
