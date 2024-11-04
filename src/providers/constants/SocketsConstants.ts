import { appEnv } from "@providers/config/env";
import { GeckosAuthMiddleware } from "@providers/middlewares/GeckosAuthMiddleware";
import { EnvType } from "@startup-engine/shared";

import { ServerOptions } from "socket.io";

export const GECKOS_CONFIG = {
  iceServers: [],
  portRange: {
    min: 20000,
    max: appEnv.general.ENV === EnvType.Development ? 20005 : 20100,
  },
  authorization: GeckosAuthMiddleware,
  cors: {
    origin: "*",
    allowAuthorization: true,
  },
};

export const SOCKET_IO_CONFIG: Partial<ServerOptions> = {
  cors: {
    origin: appEnv.general.ENV === EnvType.Development ? "*" : appEnv.general.APP_URL,
    credentials: true,
  },
  transports: ["websocket", "polling"],

  // Quick ping detection with reasonable timeout
  pingTimeout: 45000, // 45s timeout for handling network issues
  pingInterval: 5000, // 5s for quick disconnect detection

  // Basic settings
  maxHttpBufferSize: 1e6,
  connectTimeout: 45000,

  // Connection recovery
  allowUpgrades: true,
  upgradeTimeout: 10000,

  // Compression settings
  httpCompression: true,
  perMessageDeflate: {
    threshold: 1024, // Compress messages larger than 1KB
    zlibInflateOptions: {
      chunkSize: 16 * 1024, // Larger chunk size for better compression
    },
    zlibDeflateOptions: {
      level: 6, // Balanced between speed and compression
    },
    clientNoContextTakeover: true, // Save memory at cost of compression ratio
    serverNoContextTakeover: true, // Save memory at cost of compression ratio
  },
};
