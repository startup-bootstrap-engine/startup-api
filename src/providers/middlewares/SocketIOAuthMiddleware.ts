import { appEnv } from "@providers/config/env";
import { container } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import jwt from "jsonwebtoken";

export const SocketIOAuthMiddleware = (socket, next): void => {
  const userRepository = container.get<UserRepository>(UserRepository);

  const authToken = socket.handshake.auth.token.split(" ")[1];

  if (!authToken) {
    next(new Error("Unauthorized"));
  }

  try {
    jwt.verify(authToken, appEnv.authentication.JWT_SECRET!, async (err, jwtPayload: any) => {
      if (err) {
        // here we associate the error to a variable because just throwing then inside this async block won't allow them to achieve the outside scope and be caught by errorHandler.middleware. That's why we're passing then to next...
        console.log(`Authorization error: Failed at JWT verification for ${jwtPayload.email}`);
        next(new Error("Unauthorized"));
      }

      const dbUser = await userRepository.findBy(
        { email: jwtPayload.email },
        {
          virtuals: true,
          defaults: true,
          cacheQuery: {
            cacheKey: `user-${jwtPayload.email}`,
          },
        }
      );

      if (!dbUser) {
        console.log(`Authorization error: User not found (${jwtPayload.email})`);
        next(new Error("Unauthorized"));
      }

      socket.handshake.query.userData = dbUser;

      next();
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
