import { IAuthenticatedRequest } from "../types/ServerTypes";

export const NoCacheMiddleware = (req: IAuthenticatedRequest, res, next): void => {
  res.set("Cache-Control", "no-store");
  next();
};
