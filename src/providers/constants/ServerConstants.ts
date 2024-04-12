import {
  BattleSocketEvents,
  ChatSocketEvents,
  ItemSocketEvents,
  SpellSocketEvents,
  UseWithSocketEvents,
  ViewSocketEvents,
} from "@rpg-engine/shared";

import os from "os";

export const USER_CONTROL_ONLINE = {
  MAX_NUMBER_OF_PLAYERS: 100,
  MAX_NUMBER_ACC_PER_USER: 20,
};

export const SERVER_API_NODES_QTY = 4; // 4 nodes on hertzner for API only

export const SERVER_API_NODES_PM2_PROCESSES_QTY = 4; // 4 processes per node

// 10 min
export const SERVER_DISCONNECT_IDLE_TIMEOUT = 10; // how many minutes does a character needs to be inactive to be disconnected

export const USER_EXHAUST_TIMEOUT = 1500;

export const EXHAUSTABLE_EVENTS = [
  ChatSocketEvents.GlobalChatMessageCreate,
  ChatSocketEvents.GlobalChatMessageRead,
  ChatSocketEvents.PrivateChatMessageCreate,
  ItemSocketEvents.UseWith,
  "CastSpell",
  "UseWithItem",
  UseWithSocketEvents.UseWithTile,
  ItemSocketEvents.Use,
  ItemSocketEvents.CraftItem,
  UseWithSocketEvents.UseWithTile,
] as string[];

export const LOGGABLE_EVENTS = [
  ItemSocketEvents.Use,
  ItemSocketEvents.UseWith,
  ItemSocketEvents.CraftItem,
  "CastSpell",
];

export const LOCKABLE_EVENTS = [
  ItemSocketEvents.Pickup,
  ItemSocketEvents.Equip,
  ItemSocketEvents.Unequip,
  ItemSocketEvents.Drop,
  ItemSocketEvents.Use,
  ItemSocketEvents.UseWith,
  ItemSocketEvents.ContainerTransfer,
  ItemSocketEvents.CraftItem,
  ItemSocketEvents.Move,
  UseWithSocketEvents.UseWithTile,
  "UseWithItem",
  BattleSocketEvents.InitTargeting,
  BattleSocketEvents.StopTargeting,
  ItemSocketEvents.LoadCraftBook,
  ItemSocketEvents.CraftItem,
  ChatSocketEvents.GlobalChatMessageCreate,
  ViewSocketEvents.Destroy,
] as string[];

export const THROTTABLE_EVENTS_MS_THRESHOLD_DISCONNECT = 20;

export const THROTTABLE_DEFAULT_MS_THRESHOLD = 1000;

export const THROTTABLE_EVENTS = {
  [UseWithSocketEvents.UseWithTile]: 2000,
  [ItemSocketEvents.CraftItem]: 2000,
  [ChatSocketEvents.GlobalChatMessageCreate]: THROTTABLE_DEFAULT_MS_THRESHOLD,
  [SpellSocketEvents.CastSpell]: THROTTABLE_DEFAULT_MS_THRESHOLD,
  [ChatSocketEvents.PrivateChatMessageCreate]: THROTTABLE_DEFAULT_MS_THRESHOLD,
};

export const PROMISE_DEFAULT_CONCURRENCY = os.cpus().length || 2;

export const MAX_PING_TRACKING_THRESHOLD = 10000;
