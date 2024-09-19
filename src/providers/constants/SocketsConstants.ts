import { appEnv } from "@providers/config/env";
import { GeckosAuthMiddleware } from "@providers/middlewares/GeckosAuthMiddleware";
import { EnvType } from "@rpg-engine/shared";
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
  }, // required if the client and server are on separate domains
};

export const SOCKET_IO_CONFIG: Partial<ServerOptions> = {
  cors: {
    origin: appEnv.general.ENV === EnvType.Development ? "*" : appEnv.general.APP_URL,
    credentials: true,
  },

  // Optimized for MMORPG real-time interactions
  maxHttpBufferSize: 5e6, // 100MB
  pingTimeout: 80000,
  pingInterval: 10000,
};
