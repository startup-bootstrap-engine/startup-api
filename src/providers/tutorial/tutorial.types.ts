export enum AdvancedTutorialSocketEvents {
  TriggerTutorial = "TriggerTutorial",
}

export interface IAdvancedTutorialPayload {
  tutorialKey: string;
}

export enum AdvancedTutorialKeys {
  Introduction = "introduction",
  // Crafting
  Lumberjacking = "Lumberjacking",
  Fishing = "Fishing",
  Blacksmithing = "Blacksmithing",
}
