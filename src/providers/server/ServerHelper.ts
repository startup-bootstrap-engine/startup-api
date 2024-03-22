import { CharacterConnection } from "@providers/character/CharacterConnection";
import { RedisManager } from "@providers/database/RedisManager";
import { provide } from "inversify-binding-decorators";
import { appEnv } from "../config/env";
import { ConsoleHelper } from "../console/ConsoleHelper";
import { IServerBootstrapVars } from "../types/ServerTypes";

@provide(ServerHelper)
export class ServerHelper {
  constructor(private redisManager: RedisManager, private characterConnection: CharacterConnection) {}

  public showBootstrapMessage(config: IServerBootstrapVars): void {
    const {
      port,
      // appName,
      language,
      timezone,
      adminEmail,
      startupTime,
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
      `🤖: Server is running on ${appEnv.general.ENV} | Port: ${port} | Language: ${language} | Timezone: ${timezone} | Admin: ${adminEmail} | Startup time: ${startupTime}ms`,
      terminalColor
    );
  }
}
