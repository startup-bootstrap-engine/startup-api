import { RedisManager } from "@providers/database/RedisManager";
import { provide } from "inversify-binding-decorators";
import { appEnv } from "../config/env";
import { ConsoleHelper } from "../console/ConsoleHelper";
import { IServerBootstrapVars } from "../types/ServerTypes";

@provide(ServerHelper)
export class ServerHelper {
  constructor(private redisManager: RedisManager) {}

  public showBootstrapMessage(config: IServerBootstrapVars, microserviceName?: string): void {
    const { port, language, timezone, adminEmail, startupTime } = config;

    const consoleHelper = new ConsoleHelper();

    const terminalColor = this.getTerminalColor(appEnv.general.ENV!, microserviceName);

    consoleHelper.coloredLog(
      `🤖: ${microserviceName || "Server"} is running on ${
        appEnv.general.ENV
      } | Port: ${port} | Language: ${language} | Timezone: ${timezone} | Admin: ${adminEmail} | Startup time: ${startupTime}ms`,
      terminalColor as any
    );
  }

  private getTerminalColor(environment: string, microserviceName?: string): string {
    if (microserviceName === "rpg-npc") {
      return "GREEN";
    }

    switch (environment) {
      case "Development":
        return "YELLOW";
      case "Production":
        return "RED";
      default:
        return "BLUE";
    }
  }
}
