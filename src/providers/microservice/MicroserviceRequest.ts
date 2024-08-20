import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import http2 from "http2-wrapper";
import { provide } from "inversify-binding-decorators";

export enum AvailableMicroservices {
  RpgPathfinding = "rpg-pathfinding",
}

const MICROSERVICE_METADATA = {
  [AvailableMicroservices.RpgPathfinding]: {
    baseUrl: "<http://rpg-pathfinder:5004>",
  },
};

@provide(MicroserviceRequest)
export class MicroserviceRequest {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      httpAgent: new http2.Agent({
        timeout: 60000, // Timeout for idle connections
        maxSessions: 100, // Maximum number of sessions
        maxEmptySessions: 10, // Maximum number of empty sessions to keep alive
        maxCachedTlsSessions: 100, // Maximum number of cached TLS sessions
      }),
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
      // Handle error appropriately
      throw new Error(`Error requesting microservice ${microservice}: ${error.message}`);
    }
  }
}
