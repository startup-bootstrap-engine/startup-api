import { appEnv } from "@providers/config/env";
import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

interface IRateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const AuthRateLimitMiddleware = (options: IRateLimitOptions = {}): RequestHandler => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 20, // Limit each IP to 20 requests per windowMs for auth routes
    message: options.message || "Too many authentication attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const DefaultRateLimitMiddleware = (options: IRateLimitOptions = {}): RequestHandler => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000, // 1 minute
    max: options.max || 60, // Limit each IP to 60 requests per minute
    message: options.message || "Too many requests from this IP, please try again after a minute",
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const StrictRateLimitMiddleware = (options: IRateLimitOptions = {}): RequestHandler => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000, // 1 minute
    max: options.max || 10, // Limit each IP to 10 requests per minute
    message: options.message || "Too many requests from this IP, please try again after a minute",
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const GlobalRateLimitMiddleware = (options: IRateLimitOptions = {}): RequestHandler => {
  const { IS_MICROSERVICE } = appEnv.general;

  return rateLimit({
    windowMs: options.windowMs || 1 * 60 * 1000, // 1 minute
    max: options.max || 1000, // limit each IP to 1000 requests per minute
    message: options.message || "Too many requests from this IP, please try again after a minute",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
      const ip = String(req.ip);
      // Skip rate limiting for internal requests (Docker internal or microservices)
      const internalDockerRequest = ip.includes("::ffff:") || ip.includes("172.") || ip.includes("10.");
      return IS_MICROSERVICE || internalDockerRequest;
    },
  });
};
