import { provide } from "inversify-binding-decorators";

@provide(MapName)
export class MapName {
  public getFormattedMapName(mapName: string): string {
    return mapName
      .replace(/-\d+$/, "") // Remove trailing hyphen followed by digits
      .replace(/-/g, " ") // Replace remaining hyphens with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
      .join(" ");
  }
}
