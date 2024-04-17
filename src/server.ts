import "reflect-metadata";

import "express-async-errors";

import { appEnv } from "@providers/config/env";
import {
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
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const port = appEnv.general.SERVER_PORT || 3002;

if (!appEnv.general.IS_UNIT_TEST) {
  require("newrelic");
}

const server = app.listen(port, async () => {
  const startTime = dayjs();

  await newRelic.trackTransaction(
    NewRelicTransactionCategory.Operation,
    "ServerBootstrap",
    async () => {
      await Promise.all([database.initialize(), redisManager.connect(), socketAdapter.init(appEnv.socket.type)]);

      await inMemoryHashTable.init();
      await inMemoryRepository.init();

      cronJobs.start();

      await mapLoader.init(); // must be the first thing loaded!

      app.use(router);

      app.use(errorHandlerMiddleware);

      //! Dev Warning: If you want to add a new operation on server bootstrap, make sure to add it to one of the methods below (check if needs to be executed in all PM2 instances or not.)

      await serverBootstrap.performOneTimeOperations();
      await serverBootstrap.performMultipleInstancesOperations();

      if (appEnv.general.ENV === EnvType.Production) {
        console.log(`✅ Application started succesfully on PMID ${process.env.pm_id}`);
      }

      const endTime = dayjs();
      const startupTime = dayjs.duration(endTime.diff(startTime)).asMilliseconds();

      serverHelper.showBootstrapMessage({
        appName: appEnv.general.APP_NAME!,
        port: appEnv.general.SERVER_PORT!,
        timezone: appEnv.general.TIMEZONE!,
        adminEmail: appEnv.general.ADMIN_EMAIL!,
        language: appEnv.general.LANGUAGE!,
        phoneLocale: appEnv.general.PHONE_LOCALE!,
        startupTime,
      });
    },
    appEnv.general.ENV === EnvType.Development
  );
});
