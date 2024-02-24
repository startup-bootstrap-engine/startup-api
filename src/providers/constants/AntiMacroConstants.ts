import { CharacterSocketEvents, NPCSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";

export const ANTI_MACRO_PROBABILITY_TRIGGER = 10; // chance of triggering the anti-macro system, per character, each 5 minutes

// 20 min
export const ANTI_MACRO_IDLE_THRESHOLD = 20 * 60 * 1000; // 20 minutes in milliseconds

export const CHARACTER_MAX_ACTIONS_STORAGE_THRESHOLD = 50; // maximum number of actions to store per character

export const ANTI_MACRO_SKIP_EVENTS_FROM_SIMILARITY_CHECK: string[] = [
  CharacterSocketEvents.CharacterPositionUpdate,
  CharacterSocketEvents.CharacterPositionUpdateAll,
  CharacterSocketEvents.CharacterPositionUpdateConfirm,
  CharacterSocketEvents.CharacterPing,
  ViewSocketEvents.Destroy,
  NPCSocketEvents.NPCPositionRequest,
];

export const ANTI_MACRO_SIMILARITY_THRESHOLD = 0.07; // 7% similarity threshold
