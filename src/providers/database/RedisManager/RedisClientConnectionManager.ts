/* eslint-disable mongoose-lean/require-lean */
import { NewRelic } from "@providers/analytics/NewRelic";
import { NewRelicMetricCategory, NewRelicSubCategory } from "@providers/types/NewRelicTypes";
import { provide } from "inversify-binding-decorators";
import { Redis } from "ioredis";

@provide(RedisClientConnectionManager)
export class RedisClientConnectionManager {
  constructor(private newRelic: NewRelic) {}

  public async printTotalConnectedClients(client: Redis): Promise<number> {
    const clientCount = 0;
    try {
      const clientCount = await this.getConnectedClientCount(client);

      console.log("📕 Redis - Total connected clients: ", clientCount);

      this.newRelic.trackMetric(
        NewRelicMetricCategory.Count,
        NewRelicSubCategory.Server,
        "RedisClientCount",
        clientCount
      );
    } catch (error) {
      console.error("Could not fetch the total number of connected clients", error);
    }
    return clientCount;
  }

  public async killClient(client: Redis, clientId: string): Promise<void> {
    try {
      await client.client("KILL", "ID", clientId);
      console.log(`Killed client with ID: ${clientId}`);
    } catch (error) {
      console.error(`Could not kill client with ID: ${clientId}`, error);
    }
  }

  public async getClientInfo(client: Redis, clientId: string): Promise<string> {
    const clientList = await this.getConnectedClientList(client);
    const clientInfo = clientList.find((client) => client.startsWith(`id=${clientId}`));

    if (!clientInfo) {
      throw new Error(`No client found with ID: ${clientId}`);
    }

    return clientInfo;
  }

  public async getConnectedClientListNames(client: Redis): Promise<string[]> {
    const clientListArray = await this.getConnectedClientList(client);

    const clientNames = clientListArray
      .map((client) => {
        const fields = client.split(" ");
        const nameField = fields.find((field) => field.startsWith("name="));
        return nameField ? nameField.replace("name=", "") : null;
      })
      .filter(Boolean) as string[];

    return clientNames;
  }

  private async getConnectedClientList(client: Redis): Promise<string[]> {
    const clientList = (await client.client("LIST")) as any; // Assuming this.client is the IORedis client

    return clientList.split("\n");
  }

  public async getConnectedClientCount(client: Redis): Promise<number> {
    const clientList = await this.getConnectedClientList(client);

    return clientList.length - 1;
  }
}
