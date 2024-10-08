import { IUser } from "@startup-engine/shared";
import { Request } from "express";

export interface IRequestCustom extends Request {
  body: {
    [key: string]: string | undefined;
  };
}

export interface IAuthenticatedRequest extends IRequestCustom {
  user: IUser;
  ip: string;
}

export interface IServerBootstrapVars {
  appName: string;
  timezone: string;
  adminEmail: string;
  language: string;
  phoneLocale: string;
  port: string | number;
  startupTime: number;
}
