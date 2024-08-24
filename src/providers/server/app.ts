import { appEnv } from "@providers/config/env";
import { container } from "@providers/inversify/container";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { InversifyExpressServer } from "inversify-express-utils";
import morgan from "morgan";
import { ServerRequest } from "./ServerRequest";

const compression = require("compression");

// @ts-ignore
const expressServer = new InversifyExpressServer(container);

const serverRequest = container.get(ServerRequest);

const { IS_MICROSERVICE } = appEnv.general;

// Global rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
  skip: (req, res) => {
    const ip = String(req.ip);

    // Skip rate limiting for internal requests (Docker internal or microservices)
    const internalDockerRequest = serverRequest.isInternalRequest(ip);
    return IS_MICROSERVICE || internalDockerRequest;
  },
});

expressServer.setConfig((app) => {
  app.set("trust proxy", true);

  app.use(compression());
  app.use("*", cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan("dev", {
      skip: (req, res) => serverRequest.isInternalRequest(req.ip),
    })
  );
  app.use(express.static("public"));

  // Apply rate limiting only for external requests
  app.use(limiter);

  app.use(helmet());
});

const app = expressServer.build();

export { app };
