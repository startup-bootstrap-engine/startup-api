import { provide } from "inversify-binding-decorators";

import { BadRequestError } from "@providers/errors/BadRequestError";
import { NotFoundError } from "@providers/errors/NotFoundError";
import { TS } from "@providers/translation/TranslationHelper";
import { UserRepository } from "@repositories/ModuleSystem/user/UserRepository";

@provide(UnsubscribeUserUseCase)
export class UnsubscribeUserUseCase {
  constructor(private userRepository: UserRepository) {}

  public async unsubscribeUser(email: string): Promise<void> {
    const user = await this.userRepository.findBy({ email });

    if (!user) {
      throw new NotFoundError(TS.translate("validation", "notFound", { field: "User" }));
    }

    if (user.unsubscribed === true) {
      throw new BadRequestError(TS.translate("users", "userAlreadyUnsubscribed"));
    }

    await this.userRepository.updateBy({ email }, { unsubscribed: true });
  }
}
