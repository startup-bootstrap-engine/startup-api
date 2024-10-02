import { ForbiddenError } from "@providers/errors/ForbiddenError";
import { container } from "@providers/inversify/container";
import { ServerRequest } from "@providers/server/ServerRequest";
import newrelic from "@rpg-engine/newrelic";
import { NextFunction, Request, Response } from "express";

export const InternalRequestMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const serverRequest = container.get(ServerRequest);
  const ip = req.ip;

  if (serverRequest.isInternalRequest(ip)) {
    const transaction = newrelic.getTransaction(); // Get the current transaction
    transaction.ignore(); // Ignore the transaction
    next(); // Proceed with the request
  } else {
    const error = new ForbiddenError(`Forbidden: External requests are not allowed for this route. IP: ${req.ip}`);
    next(error);
  }
};
