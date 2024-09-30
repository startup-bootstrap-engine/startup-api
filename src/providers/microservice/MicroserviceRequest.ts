import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import Bottleneck from "bottleneck"; // Rate limiting library
import http from "http";
import https from "https";

export enum AvailableMicroservices {
  RpgPathfinding = "startup-pathfinding",
  RpgNPC = "startup-npc",
  RpgAPI = "startup-api",
}

const MICROSERVICE_METADATA = {
  [AvailableMicroservices.RpgPathfinding]: {
    baseUrl: "http://startup-pathfinder:5004",
  },
  [AvailableMicroservices.RpgNPC]: {
    baseUrl: "http://startup-npc:5005",
  },
  [AvailableMicroservices.RpgAPI]: {
    baseUrl: "http://startup-api:5002",
  },
};

// Agent configuration to manage HTTP/HTTPS connections efficiently and handle high throughput
const agentConfig = {
  keepAlive: true,
  maxSockets: 1000, // Consider increasing this if you have a high load
  maxFreeSockets: 100,
  timeout: 60000, // Keep idle sockets for 60 seconds
  freeSocketTimeout: 30000, // Close free sockets after 30 seconds
};

const httpAgent = new http.Agent(agentConfig);
const httpsAgent = new https.Agent(agentConfig);

@provideSingleton(MicroserviceRequest)
export class MicroserviceRequest {
  private axiosInstance: AxiosInstance;
  private limiter: Bottleneck;

  constructor() {
    this.axiosInstance = axios.create({
      httpAgent,
      httpsAgent,
      timeout: 15000, // Request timeout of 15 seconds
    });
    axiosRetry(this.axiosInstance, {
      retries: 5, // Increase the number of retries
      retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff
      retryCondition: (error) => {
        return error.code === "ECONNABORTED" || error.response?.status! >= 500 || error.code === "ECONNRESET";
      },
    });

    // Initialize rate limiter
    this.limiter = new Bottleneck({
      maxConcurrent: 200, // Maximum number of concurrent requests
      minTime: 5, // Minimum time between requests
    });
  }

  @TrackNewRelicTransaction()
  public async request<T>(
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
      const response = await this.limiter.schedule(() =>
        this.axiosInstance.request<T>({
          url,
          method,
          data,
          ...config,
        })
      );

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
