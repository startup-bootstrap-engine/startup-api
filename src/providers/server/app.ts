import { container } from "@providers/inversify/container";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { InversifyExpressServer } from "inversify-express-utils";
import morgan from "morgan";

const compression = require("compression");

// @ts-ignore
const expressServer = new InversifyExpressServer(container);

// Global rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute
});

expressServer.setConfig((app) => {
  app.set("trust proxy", true);

  app.use(compression());
  app.use("*", cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(limiter);
  app.use(helmet());
});

const app = expressServer.build();

export { app };
