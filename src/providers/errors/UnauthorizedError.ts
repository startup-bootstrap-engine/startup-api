import { HttpStatus } from "@startup-engine/shared";
import { ApplicationError } from "./ApplicationError";

export class UnauthorizedError extends ApplicationError {
  constructor(message) {
    super(message, HttpStatus.Unauthorized);

    this.error = UnauthorizedError.name;
  }
}
