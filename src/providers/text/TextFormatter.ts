import { provide } from "inversify-binding-decorators";

@provide(TextFormatter)
export class TextFormatter {
  public convertCamelCaseToSentence(input: string): string {
    const output = input.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    return output;
  }

  public truncateWithEllipsis(input: string, maxLength: number): string {
    return input.length > maxLength ? `${input.substring(0, maxLength - 3)}...` : input;
  }
}
