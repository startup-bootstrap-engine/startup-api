export enum AdvancedTutorialSocketEvents {
  TriggerTutorial = "TriggerTutorial",
}

export interface IAdvancedTutorialPayload {
  tutorialKey: string;
}

export enum AdvancedTutorialKeys {
  Introduction = "introduction",

  // Crafting
  CraftingMechanics = "CraftingMechanics",

  Lumberjacking = "Lumberjacking",
  Fishing = "Fishing",
  Blacksmithing = "Blacksmithing",
  Farming = "Farming",

  Depot = "Depot",
  Quest = "Quest",

  Marketplace = "Marketplace",
  Party = "Party",
}
