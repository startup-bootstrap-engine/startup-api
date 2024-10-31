import { container, securityMiddleware, serverRequest } from "@providers/inversify/container";
import { GlobalRateLimitMiddleware } from "@providers/middlewares/RateLimitMiddleware";
import cors from "cors";
import express from "express";
import { InversifyExpressServer } from "inversify-express-utils";
import morgan from "morgan";

const compression = require("compression");

// @ts-ignore
const expressServer = new InversifyExpressServer(container);

expressServer.setConfig((app) => {
  // Configure trust proxy to only trust our known proxy IPs
  app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

  app.use(compression());
  app.use("*", cors(securityMiddleware.getCorsOptions()));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan("dev", {
      skip: (req, res) => serverRequest.isInternalRequest(req.ip as string),
    })
  );
  app.use(express.static("public"));

  // Apply rate limiting only for external requests
  app.use(GlobalRateLimitMiddleware());

  // Apply security middleware
  app.use(...securityMiddleware.getHelmetMiddleware());
});

const app = expressServer.build();

export { app };
