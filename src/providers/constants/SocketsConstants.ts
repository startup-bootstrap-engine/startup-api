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
  transports: ["websocket", "polling"],

  // Adjusted configuration to balance performance and resource usage
  maxHttpBufferSize: 1e8, // Increase to 100MB if needed
  pingTimeout: 30000, // 30 seconds timeout
  pingInterval: 7000, // 7 seconds interval
};

/* Ping Interval

General Recommendation: A pingInterval of around 25-30 seconds is a common default in many applications, providing a balance between keeping the connection alive and minimizing unnecessary traffic. However, for more dynamic environments like MMORPGs, this might be too high.

For Responsive Gameplay: Considering the need for more responsive gameplay, a pingInterval of 1-5 seconds might be more appropriate. This range is aggressive but can help ensure that connections are alive and responsive, which is critical for fast-paced game actions.

*/
