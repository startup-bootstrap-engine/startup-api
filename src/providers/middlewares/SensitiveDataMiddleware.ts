import { NextFunction, Request, Response } from "express";

interface ISensitiveDataMiddlewareOptions {
  sensitiveFields?: string[];
}

const defaultOptions: ISensitiveDataMiddlewareOptions = {
  sensitiveFields: ["password", "refreshToken", "accessToken", "salt", "refreshTokens"],
};

export const SensitiveDataMiddleware = (
  options: ISensitiveDataMiddlewareOptions = defaultOptions
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { sensitiveFields } = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    console.log("🔒 SensitiveDataMiddleware: Processing request");

    const originalJson = res.json;

    res.json = function (body: any): Response {
      console.log("🔒 SensitiveDataMiddleware: Intercepting response", {
        hasBody: !!body,
        isArray: Array.isArray(body),
      });

      if (body) {
        if (Array.isArray(body)) {
          body = body.map((item) => filterSensitiveData(item, sensitiveFields!));
        } else {
          body = filterSensitiveData(body, sensitiveFields!);
        }
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

function filterSensitiveData(data: any, sensitiveFields: string[]): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  const filtered = { ...data };

  sensitiveFields.forEach((field) => {
    if (field in filtered) {
      delete filtered[field];
      console.log(`🔒 SensitiveDataMiddleware: Removed field "${field}"`);
    }
  });

  // Recursively filter nested objects
  Object.keys(filtered).forEach((key) => {
    if (filtered[key] && typeof filtered[key] === "object") {
      filtered[key] = filterSensitiveData(filtered[key], sensitiveFields);
    }
  });

  return filtered;
}
