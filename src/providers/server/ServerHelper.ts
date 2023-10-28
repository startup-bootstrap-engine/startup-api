import { RedisManager } from "@providers/database/RedisManager";
import { database, socketAdapter } from "@providers/inversify/container";
import { CharacterSocketEvents, EnvType } from "@rpg-engine/shared";
import { Server } from "http";
import { provide } from "inversify-binding-decorators";
import { appEnv } from "../config/env";
import { ConsoleHelper } from "../console/ConsoleHelper";
import { TS } from "../translation/TranslationHelper";
import { IServerBootstrapVars } from "../types/ServerTypes";

@provide(ServerHelper)
export class ServerHelper {
  constructor(private redisManager: RedisManager) {}

  public showBootstrapMessage(config: IServerBootstrapVars): void {
    const {
      port,
      // appName,
      language,
      timezone,
      adminEmail,
      // phoneLocale,
    } = config;

    const consoleHelper = new ConsoleHelper();

    let terminalColor;
    switch (appEnv.general.ENV) {
      case "Development":
        terminalColor = "YELLOW";
        break;
      case "Production":
        terminalColor = "RED";
        break;
      default:
        terminalColor = "BLUE";
        break;
    }

    consoleHelper.coloredLog(
      `🤖: ${TS.translate("global", "serverRunning", {
        env: appEnv.general.ENV!,
        port: String(port),
        language,
        timezone,
        adminEmail,
      })}`,
      terminalColor
    );
  }

  public gracefullyShutdown(server: Server): void {
    if (appEnv.general.ENV !== EnvType.Production) {
      return;
    }

    const terminationSignals: { signal: NodeJS.Signals; errno: number }[] = [
      { signal: "SIGINT", errno: 1 },
      { signal: "SIGTERM", errno: 1 },
    ];

    terminationSignals.forEach((termination) => {
      process.on(termination.signal, () => {
        try {
          console.info(`🛑 ${termination.signal} signal received, gracefully shutting down the server...`);

          socketAdapter.emitToAllUsers(CharacterSocketEvents.CharacterForceDisconnect); // TODO: Use an event name to inform players that they are getting disconnected because the server is restarting

          server.close(() => {
            console.info("✅ Express server closed successfully");

            setTimeout(async () => {
              // to finish all methods running in time
              console.info("🛑 Database connection closing");

              await database.close();

              await this.redisManager.disconnect();

              console.info("✅ Graceful shutdown completed");
              process.exit(128 + termination.errno);
            }, 3000);
          });
        } catch (error) {
          console.error("❌ An error occurred during graceful shutdown:", error);
          process.exit(1);
        }
      });
    });
  }
}
