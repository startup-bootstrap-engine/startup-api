import { HttpStatus } from "@startup-engine/shared";
import { ApplicationError } from "./ApplicationError";

export class MethodNotAllowedError extends ApplicationError {
  constructor(message = "Method Not Allowed") {
    super(message, HttpStatus.MethodNotAllowed);
  }
}
