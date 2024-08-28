export const BATTLE_CRITICAL_HIT_CHANCE = 1.5; // %
export const BATTLE_CRITICAL_HIT_DAMAGE_MULTIPLIER = 1.8;
export const BATTLE_HIT_CHANCE_MULTIPLIER = 2;
// Remember that the block is only applied if the hit wasn't miss,
// so the chance to counter hit is much higher than the max 20% (At least 50% to hit and 20% to block, so it's ~90% chance to counter hit)
export const BATTLE_BLOCK_CHANCE_MULTIPLIER = 0.2;
export const BATTLE_MINIMUM_HIT_CHANCE = 50; // %
export const BONUS_DAMAGE_MULTIPLIER = 4;

// Damage Reduction
export const DAMAGE_REDUCTION_MIN_DAMAGE = 1;
export const DAMAGE_REDUCTION_MAX_REDUCTION_PERCENTAGE = 0.6;
export const DAMAGE_REDUCTION_MIN_LEVEL_FOR_NPC = 30; // min level for NPC to have damage reduction

// Total potential damage

export const BATTLE_TOTAL_POTENTIAL_DAMAGE_MODIFIER = 1.25;

// NPC damage reduction

export const NPC_DAMAGE_REDUCTION_RATIO = 0.85; // lower means less damage on NPC (more challenging game)

// Rogue

export const STEALTH_DETECTION_THRESHOLD = 0.025;

export const BATTLE_PVP_MELEE_DAMAGE_RATIO = 3;

// Berserker

export const BERSERKER_BLOODTHIRST_HEALING_FACTOR = 1.5;

// Mages

export const MAGE_MANA_SHIELD_DAMAGE_REDUCTION = 1; // 100% damage reduction

export const GENERATE_BLOOD_GROUND_ON_HIT = 5; // 5% chance to generate blood on the ground

export const GENERATE_BLOOD_ON_DEATH = 100; // 100% chance to generate blood on death
