export enum AdvancedTutorialSocketEvents {
  TriggerTutorial = "TriggerTutorial",
}

export interface IAdvancedTutorialPayload {
  tutorialKey: string;
}

export enum AdvancedTutorialKeys {
  Introduction = "introduction",
  // Crafting
  Fishing = "Fishing",
  Blacksmithing = "Blacksmithing",
}
