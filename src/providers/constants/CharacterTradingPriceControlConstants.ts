import { RangedWeaponsBlueprint } from "@providers/item/data/types/itemsBlueprintTypes";

export const TRADING_PRICE_CONTROL_TRADING_HISTORY_MAX_DAYS = 7; // Max days to keep trading history of items purchased, so we can adjust prices based on demand

export const TRADING_PRICE_CONTROL_RATIO_MIN_VALUE = 0.1; // The lowest value the ratio can be. NPCs will use this to calculate a price paid for an item.
export const TRADING_PRICE_CONTROL_RATIO_MAX_VALUE = 10; // The highest value the ratio can be. NPCs will use this to calculate a price paid for an item.

export const TRADING_PRICE_CONTROL_PRICE_RATIO_DATA_WINDOW_DAYS = 7; // The amount of days of trading history to consider when calculating the price adjustment ratio

export const TRADING_PRICE_CONTROL_RATIO_SENSITIVITY = 0.08; // The sensitivity of the price adjustment ratio. The higher the value, the more sensitive the price adjustment will be to the amount of items bought or sold

export const TRADING_PRICE_CONTROL_SKIP_CONTROL = [RangedWeaponsBlueprint.WoodenArrow];
