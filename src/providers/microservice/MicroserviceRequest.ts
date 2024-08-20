import { TrackNewRelicTransaction } from "@providers/analytics/decorator/TrackNewRelicTransaction";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export enum AvailableMicroservices {
  RpgPathfinding = "rpg-pathfinding",
}

const MICROSERVICE_METADATA = {
  [AvailableMicroservices.RpgPathfinding]: {
    baseUrl: "http://rpg-pathfinder:5004",
  },
};

@provideSingleton(MicroserviceRequest)
export class MicroserviceRequest {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();
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
