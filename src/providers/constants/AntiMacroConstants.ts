import { CharacterSocketEvents, NPCSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";

export const ANTI_MACRO_PROBABILITY_TRIGGER = 1; // chance of triggering the anti-macro system, per character, each 5 minutes

// 30 min
export const ANTI_MACRO_IDLE_THRESHOLD = 30 * 60 * 1000; // 20 minutes in milliseconds

export const CHARACTER_MAX_ACTIONS_STORAGE_THRESHOLD = 50; // maximum number of actions to store per character

export const ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK: string[] = [
  CharacterSocketEvents.CharacterPositionUpdate,
  CharacterSocketEvents.CharacterPositionUpdateAll,
  CharacterSocketEvents.CharacterPositionUpdateConfirm,
  CharacterSocketEvents.CharacterPing,
  ViewSocketEvents.Destroy,
  NPCSocketEvents.NPCPositionRequest,
];

export const ANTI_MACRO_ACTION_SIMILARITY_RATIO_THRESHOLD = 0.07; // constant is used to set a threshold for detecting potential macro usage based on action similarity. If the ratio of unique actions to total actions falls below this threshold (0.07 in this case), it suggests that the actions are too similar and may be the result of macro usage.
