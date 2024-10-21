import jwt from "jsonwebtoken";

import { container } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { appEnv } from "../config/env";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { TS } from "../translation/TranslationHelper";
import { IAuthenticatedRequest } from "../types/ServerTypes";

interface IAuthMiddlewareOptions {
  hideSensitiveUserFields?: boolean;
}

const defaultOptions: IAuthMiddlewareOptions = {
  hideSensitiveUserFields: true,
};

export const AuthMiddleware = (options: IAuthMiddlewareOptions = defaultOptions) => {
  return async (req: IAuthenticatedRequest, res, next): Promise<void> => {
    const { hideSensitiveUserFields } = { ...defaultOptions, ...options };
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

      try {
        const jwtPayload: any = await new Promise((resolve, reject) => {
          jwt.verify(token, appEnv.authentication.JWT_SECRET!, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
          });
        });

        const userRepository = container.get(UserRepository);

        const dbUser = await userRepository.findBy(
          { email: jwtPayload?.email },
          {
            hideSensitiveFields: hideSensitiveUserFields ? ["password", "salt"] : [],
          }
        );

        if (!dbUser) {
          throw new UnauthorizedError(TS.translate("auth", "loginAccessResource"));
        }

        req.user = dbUser;
        next();
      } catch (error) {
        next(new UnauthorizedError(TS.translate("auth", "loginAccessResource")));
      }
    } else {
      next(new UnauthorizedError(TS.translate("auth", "notAllowedResource")));
    }
  };
};
