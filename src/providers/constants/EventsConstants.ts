import { NPCSocketEvents, ViewSocketEvents } from "@rpg-engine/shared";

export const BYPASS_EVENTS_AS_LAST_ACTION = [ViewSocketEvents.Destroy, NPCSocketEvents.NPCPositionRequest];
