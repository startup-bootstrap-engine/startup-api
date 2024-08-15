import { NewRelicTransactionCategory } from "@providers/types/NewRelicTypes";
import { NewRelic } from "../NewRelic";

export function TrackTransactionDecorator(): MethodDecorator {
  const newRelic = new NewRelic();
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunction: (...args: any[]) => any = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<any> {
      const className = target.constructor.name;
      const methodName = propertyKey;
      try {
        const result = await originalFunction.apply(this, args);
        return await newRelic.trackPromiseTransaction(
          NewRelicTransactionCategory.Operation,
          `${className}.${methodName}`,
          Promise.resolve(result)
        );
      } catch (error) {
        console.error(`Error in ${className}.${methodName}:`, error);
        await newRelic.trackPromiseTransaction(
          NewRelicTransactionCategory.Operation,
          `${className}.${methodName}`,
          Promise.reject(error)
        );
        throw error; // Re-throw the error to maintain original behavior
      }
    };
  };
}
