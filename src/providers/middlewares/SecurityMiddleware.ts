import { appEnv } from "@providers/config/env";
import { EnvType } from "@startup-engine/shared";
import { CorsOptions } from "cors";
import { RequestHandler } from "express";
import helmet from "helmet";
import { provide } from "inversify-binding-decorators";

@provide(SecurityMiddleware)
export class SecurityMiddleware {
  public getHelmetMiddleware(): RequestHandler[] {
    return [
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: { policy: "same-site" },
        dnsPrefetchControl: true,
        frameguard: { action: "deny" },
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: "none" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        xssFilter: true,
      }),
    ];
  }

  public getCorsOptions(): CorsOptions {
    return {
      origin: appEnv.general.ENV === EnvType.Production ? [appEnv.general.WEB_APP_URL!].filter(Boolean) : "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400, // 24 hours
    };
  }
}
