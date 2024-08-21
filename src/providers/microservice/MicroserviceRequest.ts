import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
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

// Agent configuration to manage HTTP/HTTPS connections efficiently and handle high throughput
const agentConfig = {
  keepAlive: true, // Reuse TCP connections for multiple requests
  maxSockets: 500, // Maximum number of sockets to allow per host
  maxFreeSockets: 50, // Maximum number of idle sockets to keep open
  timeout: 60000, // Time to keep idle sockets alive (60 seconds)
};

const httpAgent = new http.Agent(agentConfig);
const httpsAgent = new https.Agent(agentConfig);

@provideSingleton(MicroserviceRequest)
export class MicroserviceRequest {
  private axiosInstance: AxiosInstance;

  constructor() {
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
      const response = await this.axiosInstance.request<T>({
        url,
        method,
        data,
        ...config,
      });

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
