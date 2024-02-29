import { NewRelic } from "@providers/analytics/NewRelic";
import { provide } from "inversify-binding-decorators";

@provide(ErrorHandlingTracker)
export class ErrorHandlingTracker {
  constructor(private newRelic: NewRelic) {}

  public overrideErrorHandling(): void {
    const originalConsoleError = console.error;

    console.error = (...args: any[]): void => {
      originalConsoleError.apply(console, args);

      const errorMessage = args.map((arg) => (arg instanceof Error ? arg.stack : arg.toString())).join(" ");

      this.newRelic.noticeError(new Error(errorMessage));
    };
  }
}
