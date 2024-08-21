import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { ResultsPoller } from "@providers/poller/ResultsPoller";
import { DynamicQueue } from "@providers/queue/DynamicQueue";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import http from "http";
import https from "https";

export enum AvailableMicroservices {
  RpgPathfinding = "rpg-pathfinding",
}

const MICROSERVICE_METADATA = {
  [AvailableMicroservices.RpgPathfinding]: {
    baseUrl: "http://rpg-pathfinder:5004",
  },
};

const agentConfig = {
  keepAlive: true,
  maxSockets: 500, // Adjust based on your load
  maxFreeSockets: 50, // Keep some idle sockets alive
  timeout: 60000, // Idle session timeout of 60 seconds
};

const httpAgent = new http.Agent(agentConfig);
const httpsAgent = new https.Agent(agentConfig);

@provideSingleton(MicroserviceRequest)
export class MicroserviceRequest {
  private axiosInstance: AxiosInstance;

  constructor(private dynamicQueue: DynamicQueue, private resultsPoller: ResultsPoller) {
    this.axiosInstance = axios.create({
      httpAgent,
      httpsAgent,
      timeout: 5000, // Request timeout of 5 seconds
    });
  }

  @TrackNewRelicTransaction()
  public async requestMicroservice<T>(
    microservice: AvailableMicroservices,
    endpoint: string,
    data: any,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const microserviceConfig = MICROSERVICE_METADATA[microservice];

    if (!microserviceConfig) {
      throw new Error(`Microservice ${microservice} not found`);
    }

    const url = `${microserviceConfig.baseUrl}${endpoint}`;

    try {
      console.time("microservice-request");
      const response = await this.axiosInstance.request<T>({
        url,
        method,
        data,
        ...config,
      });
      console.timeEnd("microservice-request");

      return response.data;
    } catch (error) {
      // Enhanced error logging
      if (axios.isAxiosError(error)) {
        console.error(`Error details:
          Microservice: ${microservice}
          URL: ${url}
          Method: ${method}
          Data: ${JSON.stringify(data, null, 2)}
          Config: ${JSON.stringify(config, null, 2)}
          Error Message: ${error.message}
          Status: ${error.response?.status}
          Status Text: ${error.response?.statusText}
          Response Data: ${JSON.stringify(error.response?.data, null, 2)}
          Request Headers: ${JSON.stringify(error.config.headers, null, 2)}
          Network Error: ${error.isAxiosError ? "Yes" : "No"}
        `);
      } else {
        console.error(`Unknown error: ${error.message}`);
      }

      // Re-throw the error after logging
      throw new Error(`Error requesting microservice ${microservice}: ${error.message}`);
    }
  }
}
