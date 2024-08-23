import { container } from "@providers/inversify/container";
import { ServerRequest } from "@providers/server/ServerRequest";
import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/ForbiddenError"; // You can create a custom error class if needed

export const InternalRequestMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const serverRequest = container.get(ServerRequest);

  const ip = req.ip;

  if (serverRequest.isInternalRequest(ip)) {
    next(); // Proceed if the request is internal
  } else {
    const error = new ForbiddenError(`Forbidden: External requests are not allowed. IP: ${req.ip}`);
    next(error);
  }
};
