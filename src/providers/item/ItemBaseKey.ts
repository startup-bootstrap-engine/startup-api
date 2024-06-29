import { provide } from "inversify-binding-decorators";

@provide(ItemBaseKey)
export class ItemBaseKey {
  public getBaseKey(key: string): string {
    return key.replace(/-\d+$/, "");
  }
}
