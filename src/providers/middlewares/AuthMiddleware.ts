import jwt from "jsonwebtoken";

import { container } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { appEnv } from "../config/env";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { TS } from "../translation/TranslationHelper";
import { IAuthenticatedRequest } from "../types/ServerTypes";

export const AuthMiddleware = (req: IAuthenticatedRequest, res, next): void => {
  let authHeader = req.headers.authorization;

  // Development only :: accepting requests from swagger jwt
  if (appEnv.general.ENV === "Development") {
    const swaggerRoot = `${appEnv.general.API_URL}/api-docs/`;
    if (req.headers.referer === swaggerRoot) {
      authHeader = "Bearer " + appEnv.general.SWAGGER_AUTH_TOKEN;
    }
  }

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, appEnv.authentication.JWT_SECRET!, async (err, jwtPayload: any) => {
      if (err || !jwtPayload) {
        // here we associate the error to a variable because just throwing then inside this async block won't allow them to achieve the outside scope and be caught by errorHandler.middleware. That's why we're passing then to next...
        const error = new UnauthorizedError(TS.translate("auth", "loginAccessResource"));
        next(error);
      }

      const userRepository = container.get(UserRepository);

      const dbUser = await userRepository.findBy(
        { email: jwtPayload?.email },
        {
          hideSensitiveFields: ["password", "salt"],
        }
      );

      if (!dbUser) {
        const error = new UnauthorizedError(TS.translate("auth", "loginAccessResource"));
        next(error);
      } else {
        req.user = dbUser;
      }

      next();
    });
  } else {
    throw new UnauthorizedError(TS.translate("auth", "notAllowedResource"));
  }
};
