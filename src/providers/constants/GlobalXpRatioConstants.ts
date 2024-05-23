// Those affect base xp and "double xp"
export const DEFAULT_XP_RATIO = 1;
export const UPDATE_XP_RATIO = 2.5;

// Can activate bonus xp in one or multiple days_
export const DAYS_ON: number[] = [4]; // Example: Sunday, Wednesday, Friday

// Frequency to check to activate or deactivate bonus
export const BONUS_XP_CRON_STRING = "*/3 * * * *"; // Each 30 min check

// discord msg
export const BONUS_XP_DISCORD_MESSAGE = "✨ Bonus XP Event ✨\n\n* ✨ Bonus XP Saturday. ✨";
export const BONUS_XP_CHANNEL = "announcements";

// Server msg
export const BONUS_XP_MESSAGE = "✨ Bonus XP Event ✨\n\n* ✨ Bonus XP Saturday. ✨";
