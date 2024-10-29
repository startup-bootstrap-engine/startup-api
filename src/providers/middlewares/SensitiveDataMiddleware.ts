import { NextFunction, Request, Response } from "express";

interface ISensitiveDataMiddlewareOptions {
  sensitiveFields?: string[];
  excludeFromHiding?: string[];
}

const defaultOptions: ISensitiveDataMiddlewareOptions = {
  sensitiveFields: ["password", "refreshToken", "accessToken", "salt", "refreshTokens"],
  excludeFromHiding: [],
};

export const SensitiveDataMiddleware = (
  options: ISensitiveDataMiddlewareOptions = defaultOptions
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const { sensitiveFields, excludeFromHiding } = { ...defaultOptions, ...options };

  // Filter out excluded fields from sensitive fields
  const effectiveSensitiveFields = sensitiveFields?.filter((field) => !excludeFromHiding?.includes(field));

  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json;

    res.json = function (body: any): Response {
      if (body) {
        if (Array.isArray(body)) {
          body = body.map((item) => filterSensitiveData(item, effectiveSensitiveFields!));
        } else {
          body = filterSensitiveData(body, effectiveSensitiveFields!);
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
