import jwt from "jsonwebtoken";

import { container } from "@providers/inversify/container";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";
import { appEnv } from "../config/env";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { TS } from "../translation/TranslationHelper";
import { IAuthenticatedRequest } from "../types/ServerTypes";

interface IAuthMiddlewareOptions {
  sensitiveFields?: string[];
  hideSensitiveUserFields?: boolean;
  excludeFromHiding?: string[];
}

const defaultOptions: IAuthMiddlewareOptions = {
  sensitiveFields: ["password", "salt", "refreshTokens"],
  hideSensitiveUserFields: true,
  excludeFromHiding: [],
};

export const AuthMiddleware = (options: IAuthMiddlewareOptions = defaultOptions) => {
  return async (req: IAuthenticatedRequest, res, next): Promise<void> => {
    const { hideSensitiveUserFields, excludeFromHiding } = { ...defaultOptions, ...options };
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
            if (err) {
              // Check if error is due to token expiration
              if (err.name === "TokenExpiredError") {
                reject(new UnauthorizedError("Your session has expired. Please login again."));
              } else {
                reject(err);
              }
            } else {
              resolve(decoded);
            }
          });
        });

        const userRepository = container.get(UserRepository);

        const sensitiveFields = options.sensitiveFields?.filter((field) => !excludeFromHiding?.includes(field));

        const dbUser = await userRepository.findBy(
          { email: jwtPayload?.email },
          {
            hideSensitiveFields: hideSensitiveUserFields ? sensitiveFields : [],
          }
        );

        if (!dbUser) {
          console.log("dbUser", dbUser);
          throw new UnauthorizedError(TS.translate("auth", "loginAccessResource"));
        }

        req.user = dbUser;
        next();
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          next(error);
        } else {
          next(new UnauthorizedError(TS.translate("auth", "loginAccessResource")));
        }
      }
    } else {
      next(new UnauthorizedError(TS.translate("auth", "notAllowedResource")));
    }
  };
};
