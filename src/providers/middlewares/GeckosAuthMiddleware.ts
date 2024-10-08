import { appEnv } from "@providers/config/env";
import { container } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { HttpStatus, IUser } from "@startup-engine/shared";
import http from "http";
import jwt from "jsonwebtoken";

export const GeckosAuthMiddleware = async (
  auth: string | undefined,
  request: http.IncomingMessage,
  response: http.OutgoingMessage
): Promise<HttpStatus | IUser> => {
  const userRepository = container.get<UserRepository>(UserRepository);

  const authToken = auth?.split(" ")[1];

  if (!authToken) {
    return HttpStatus.Unauthorized;
  }

  return await new Promise((resolve, reject) => {
    try {
      jwt.verify(authToken, appEnv.authentication.JWT_SECRET!, async (err, jwtPayload: any) => {
        if (err) {
          // here we associate the error to a variable because just throwing then inside this async block won't allow them to achieve the outside scope and be caught by errorHandler.middleware. That's why we're passing then to next...
          console.log(`Authorization error: Failed at JWT verification for ${jwtPayload.email}`);
          reject(HttpStatus.Unauthorized);
        }

        const dbUser = await userRepository.findBy({ email: jwtPayload.email });

        if (!dbUser) {
          console.log(`Authorization error: User not found (${jwtPayload.email})`);
          return reject(HttpStatus.Unauthorized);
        }

        resolve(dbUser);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};
