import { profanity } from "@2toad/profanity";
import { provide } from "inversify-binding-decorators";

@provide(GuildValidation)
export class GuildValidation {
  public validateGuildName(name: string): { isValid: boolean; message?: string } {
    if (name.length < 3 || name.length > 20) {
      return { isValid: false, message: "Guild name must be between 3 and 20 characters long." };
    }

    if (profanity.exists(name)) {
      return { isValid: false, message: "Guild name contains inappropriate language." };
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return { isValid: false, message: "Guild name can only contain letters, numbers, and spaces." };
    }

    return { isValid: true };
  }

  public validateGuildTag(tag: string): { isValid: boolean; message?: string } {
    if (tag.length < 2 || tag.length > 5) {
      return { isValid: false, message: "Guild tag must be between 2 and 5 characters long." };
    }

    if (profanity.exists(tag)) {
      return { isValid: false, message: "Guild tag contains inappropriate language." };
    }

    if (!/^[a-zA-Z0-9]+$/.test(tag)) {
      return { isValid: false, message: "Guild tag can only contain letters and numbers." };
    }

    return { isValid: true };
  }
}
