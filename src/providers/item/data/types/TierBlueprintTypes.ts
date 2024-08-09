import {
  IEquippableArmorBlueprint,
  IEquippableItemBlueprint,
  IEquippableRangedAmmoBlueprint,
  IEquippableRangedWeaponOneHandedBlueprint,
  IEquippableRangedWeaponTwoHandedBlueprint,
  IEquippableStaffBlueprint,
  IEquippableWeaponBlueprint,
  IItemGem,
} from "@rpg-engine/shared";
import { RangedWeaponsBlueprint } from "./itemsBlueprintTypes";

// Accessory ========================================

export type AccessoryTier0Attack = 0 | 1 | 2 | 3;
export type AccessoryTier0Defense = 0 | 1 | 2 | 3;

export type AccessoryTier1Attack = AccessoryTier0Attack | 4 | 5 | 6;
export type AccessoryTier1Defense = AccessoryTier0Defense | 4 | 5 | 6;

export type AccessoryTier2Attack = AccessoryTier1Attack | 7 | 8 | 9;
export type AccessoryTier2Defense = AccessoryTier1Defense | 7 | 8 | 9;

export type AccessoryTier3Attack = AccessoryTier2Attack | 10 | 11 | 12;
export type AccessoryTier3Defense = AccessoryTier2Defense | 10 | 11 | 12;

export type AccessoryTier4Attack = AccessoryTier3Attack | 13 | 14 | 15;
export type AccessoryTier4Defense = AccessoryTier3Defense | 13 | 14 | 15;

export type AccessoryTier5Attack = AccessoryTier4Attack | 16 | 17 | 18;
export type AccessoryTier5Defense = AccessoryTier4Defense | 16 | 17 | 18;

export type AccessoryTier6Attack = AccessoryTier5Attack | 19 | 20 | 21;
export type AccessoryTier6Defense = AccessoryTier5Defense | 19 | 20 | 21;

export type AccessoryTier7Attack = AccessoryTier6Attack | 22 | 23 | 24;
export type AccessoryTier7Defense = AccessoryTier6Defense | 22 | 23 | 24;

export type AccessoryTier8Attack = AccessoryTier7Attack | 25 | 26 | 27;
export type AccessoryTier8Defense = AccessoryTier7Defense | 25 | 26 | 27;

export type AccessoryTier9Attack = AccessoryTier8Attack | 28 | 29 | 30;
export type AccessoryTier9Defense = AccessoryTier8Defense | 28 | 29 | 30;

export type AccessoryTier10Attack = AccessoryTier9Attack | 31 | 32 | 33;
export type AccessoryTier10Defense = AccessoryTier9Defense | 31 | 32 | 33;

export type AccessoryTier11Attack = AccessoryTier10Attack | 34 | 35 | 36;
export type AccessoryTier11Defense = AccessoryTier10Defense | 34 | 35 | 36;

export type AccessoryTier12Attack = AccessoryTier11Attack | 37 | 38 | 39;
export type AccessoryTier12Defense = AccessoryTier11Defense | 37 | 38 | 39;

export type AccessoryTier13Attack = AccessoryTier12Attack | 40 | 41 | 42;
export type AccessoryTier13Defense = AccessoryTier12Defense | 40 | 41 | 42;

export type AccessoryTier14Attack = AccessoryTier13Attack | 43 | 44 | 45;
export type AccessoryTier14Defense = AccessoryTier13Defense | 43 | 44 | 45;

export type AccessoryTier15Attack = AccessoryTier14Attack | 46 | 47 | 48;
export type AccessoryTier15Defense = AccessoryTier14Defense | 46 | 47 | 48;

export type AccessoryTier16Attack = AccessoryTier15Attack | 49 | 50 | 51;
export type AccessoryTier16Defense = AccessoryTier15Defense | 49 | 50 | 51;

export type AccessoryTier17Attack = AccessoryTier16Attack | 52 | 53 | 54;
export type AccessoryTier17Defense = AccessoryTier16Defense | 52 | 53 | 54;

export type AccessoryTier18Attack = AccessoryTier17Attack | 55 | 56 | 57;
export type AccessoryTier18Defense = AccessoryTier17Defense | 55 | 56 | 57;

export type AccessoryTier19Attack = AccessoryTier18Attack | 58 | 59 | 60;
export type AccessoryTier19Defense = AccessoryTier18Defense | 58 | 59 | 60;

export type AccessoryTier20Attack = AccessoryTier19Attack | 61 | 62 | 63;
export type AccessoryTier20Defense = AccessoryTier19Defense | 61 | 62 | 63;

export type AccessoryTier21Attack = AccessoryTier20Attack | 64 | 65 | 66;
export type AccessoryTier21Defense = AccessoryTier20Defense | 64 | 65 | 66;

export type AccessoryTier22Attack = AccessoryTier21Attack | 67 | 68 | 69;
export type AccessoryTier22Defense = AccessoryTier21Defense | 67 | 68 | 69;

export type AccessoryTier23Attack = AccessoryTier22Attack | 70 | 71 | 72;
export type AccessoryTier23Defense = AccessoryTier22Defense | 70 | 71 | 72;

export type AccessoryTier24Attack = AccessoryTier23Attack | 71 | 72 | 73;
export type AccessoryTier24Defense = AccessoryTier23Defense | 71 | 72 | 73;

export type AccessoryTier25Attack = AccessoryTier24Attack | 74 | 75 | 76;
export type AccessoryTier25Defense = AccessoryTier24Defense | 74 | 75 | 76;

export type AccessoryTier26Attack = AccessoryTier25Attack | 77 | 78 | 79;
export type AccessoryTier26Defense = AccessoryTier25Defense | 77 | 78 | 79;

export type AccessoryTier27Attack = AccessoryTier26Attack | 80 | 81 | 82;
export type AccessoryTier27Defense = AccessoryTier26Defense | 80 | 81 | 82;

export type AccessoryTier28Attack = AccessoryTier27Attack | 83 | 84 | 85;
export type AccessoryTier28Defense = AccessoryTier27Defense | 83 | 84 | 85;

export type AccessoryTier29Attack = AccessoryTier28Attack | 86 | 87 | 88;
export type AccessoryTier29Defense = AccessoryTier28Defense | 86 | 87 | 88;

export type AccessoryTier30Attack = AccessoryTier29Attack | 89 | 90 | 91;
export type AccessoryTier30Defense = AccessoryTier29Defense | 89 | 90 | 91;

export type AccessoryTier31Attack = AccessoryTier30Attack | 92 | 93 | 94;
export type AccessoryTier31Defense = AccessoryTier30Defense | 92 | 93 | 94;

export interface IEquippableAccessoryTier0Blueprint extends IEquippableItemBlueprint {
  tier: 0;
  attack: AccessoryTier0Attack;
  defense: AccessoryTier0Defense;
}

export interface IEquippableAccessoryTier1Blueprint extends IEquippableItemBlueprint {
  tier: 1;
  attack: AccessoryTier1Attack;
  defense: AccessoryTier1Defense;
}

export interface IEquippableAccessoryTier2Blueprint extends IEquippableItemBlueprint {
  tier: 2;
  attack: AccessoryTier2Attack;
  defense: AccessoryTier2Defense;
}

export interface IEquippableAccessoryTier3Blueprint extends IEquippableItemBlueprint {
  tier: 3;
  attack: AccessoryTier3Attack;
  defense: AccessoryTier3Defense;
}

export interface IEquippableAccessoryTier4Blueprint extends IEquippableItemBlueprint {
  tier: 4;
  attack: AccessoryTier4Attack;
  defense: AccessoryTier4Defense;
}

export interface IEquippableAccessoryTier5Blueprint extends IEquippableItemBlueprint {
  tier: 5;
  attack: AccessoryTier5Attack;
  defense: AccessoryTier5Defense;
}

export interface IEquippableAccessoryTier6Blueprint extends IEquippableItemBlueprint {
  tier: 6;
  attack: AccessoryTier6Attack;
  defense: AccessoryTier6Defense;
}

export interface IEquippableAccessoryTier7Blueprint extends IEquippableItemBlueprint {
  tier: 7;
  attack: AccessoryTier7Attack;
  defense: AccessoryTier7Defense;
}

export interface IEquippableAccessoryTier8Blueprint extends IEquippableItemBlueprint {
  tier: 8;
  attack: AccessoryTier8Attack;
  defense: AccessoryTier8Defense;
}

export interface IEquippableAccessoryTier9Blueprint extends IEquippableItemBlueprint {
  tier: 9;
  attack: AccessoryTier9Attack;
  defense: AccessoryTier9Defense;
}

export interface IEquippableAccessoryTier10Blueprint extends IEquippableItemBlueprint {
  tier: 10;
  attack: AccessoryTier10Attack;
  defense: AccessoryTier10Defense;
}

export interface IEquippableAccessoryTier11Blueprint extends IEquippableItemBlueprint {
  tier: 11;
  attack: AccessoryTier11Attack;
  defense: AccessoryTier11Defense;
}
export interface IEquippableAccessoryTier12Blueprint extends IEquippableItemBlueprint {
  tier: 12;
  attack: AccessoryTier12Attack;
  defense: AccessoryTier12Defense;
}
export interface IEquippableAccessoryTier13Blueprint extends IEquippableItemBlueprint {
  tier: 13;
  attack: AccessoryTier13Attack;
  defense: AccessoryTier13Defense;
}
export interface IEquippableAccessoryTier14Blueprint extends IEquippableItemBlueprint {
  tier: 14;
  attack: AccessoryTier14Attack;
  defense: AccessoryTier14Defense;
}
export interface IEquippableAccessoryTier15Blueprint extends IEquippableItemBlueprint {
  tier: 15;
  attack: AccessoryTier15Attack;
  defense: AccessoryTier15Defense;
}
export interface IEquippableAccessoryTier16Blueprint extends IEquippableItemBlueprint {
  tier: 16;
  attack: AccessoryTier16Attack;
  defense: AccessoryTier16Defense;
}
export interface IEquippableAccessoryTier17Blueprint extends IEquippableItemBlueprint {
  tier: 17;
  attack: AccessoryTier17Attack;
  defense: AccessoryTier17Defense;
}
export interface IEquippableAccessoryTier18Blueprint extends IEquippableItemBlueprint {
  tier: 18;
  attack: AccessoryTier18Attack;
  defense: AccessoryTier18Defense;
}

export interface IEquippableAccessoryTier19Blueprint extends IEquippableItemBlueprint {
  tier: 19;
  attack: AccessoryTier19Attack;
  defense: AccessoryTier19Defense;
}

export interface IEquippableAccessoryTier20Blueprint extends IEquippableItemBlueprint {
  tier: 20;
  attack: AccessoryTier20Attack;
  defense: AccessoryTier20Attack;
}

export interface IEquippableAccessoryTier21Blueprint extends IEquippableItemBlueprint {
  tier: 21;
  attack: AccessoryTier21Attack;
  defense: AccessoryTier21Attack;
}

export interface IEquippableAccessoryTier22Blueprint extends IEquippableItemBlueprint {
  tier: 22;
  attack: AccessoryTier22Attack;
  defense: AccessoryTier22Attack;
}

export interface IEquippableAccessoryTier23Blueprint extends IEquippableItemBlueprint {
  tier: 23;
  attack: AccessoryTier23Attack;
  defense: AccessoryTier23Attack;
}

export interface IEquippableAccessoryTier24Blueprint extends IEquippableItemBlueprint {
  tier: 24;
  attack: AccessoryTier24Attack;
  defense: AccessoryTier24Attack;
}

export interface IEquippableAccessoryTier25Blueprint extends IEquippableItemBlueprint {
  tier: 25;
  attack: AccessoryTier25Attack;
  defense: AccessoryTier25Attack;
}

export interface IEquippableAccessoryTier26Blueprint extends IEquippableItemBlueprint {
  tier: 26;
  attack: AccessoryTier26Defense;
  defense: AccessoryTier26Defense;
}

export interface IEquippableAccessoryTier27Blueprint extends IEquippableItemBlueprint {
  tier: 27;
  attack: AccessoryTier27Defense;
  defense: AccessoryTier27Defense;
}

export interface IEquippableAccessoryTier28Blueprint extends IEquippableItemBlueprint {
  tier: 28;
  attack: AccessoryTier28Defense;
  defense: AccessoryTier28Defense;
}

export interface IEquippableAccessoryTier29Blueprint extends IEquippableItemBlueprint {
  tier: 29;
  attack: AccessoryTier29Defense;
  defense: AccessoryTier29Defense;
}

export interface IEquippableAccessoryTier30Blueprint extends IEquippableItemBlueprint {
  tier: 30;
  attack: AccessoryTier30Defense;
  defense: AccessoryTier30Defense;
}

export interface IEquippableAccessoryTier31Blueprint extends IEquippableItemBlueprint {
  tier: 31;
  attack: AccessoryTier31Defense;
  defense: AccessoryTier31Defense;
}

// Melee ========================================

export type WeaponTier0Attack = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type WeaponTier0Defense = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type WeaponTier1Attack = WeaponTier0Attack | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type WeaponTier1Defense = WeaponTier0Defense | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type WeaponTier2Attack = WeaponTier1Attack | 16 | 17 | 18 | 19 | 20 | 21 | 22;
export type WeaponTier2Defense = WeaponTier1Defense | 16 | 17 | 18 | 19 | 20 | 21 | 22;

export type WeaponTier3Attack = WeaponTier2Attack | 23 | 24 | 25 | 26 | 27 | 28 | 29;
export type WeaponTier3Defense = WeaponTier2Defense | 23 | 24 | 25 | 26 | 27 | 28 | 29;

export type WeaponTier4Attack = WeaponTier3Attack | 30 | 31 | 32 | 33 | 34 | 35 | 36;
export type WeaponTier4Defense = WeaponTier3Defense | 30 | 31 | 32 | 33 | 34 | 35 | 36;

export type WeaponTier5Attack = WeaponTier4Attack | 37 | 38 | 39 | 40 | 41 | 42 | 43;
export type WeaponTier5Defense = WeaponTier4Defense | 37 | 38 | 39 | 40 | 41 | 42 | 43;

export type WeaponTier6Attack = WeaponTier5Attack | 44 | 45 | 46 | 47 | 48 | 49 | 50;
export type WeaponTier6Defense = WeaponTier5Defense | 44 | 45 | 46 | 47 | 48 | 49 | 50;

export type WeaponTier7Attack = WeaponTier6Attack | 51 | 52 | 53 | 54 | 55 | 56 | 57;
export type WeaponTier7Defense = WeaponTier6Defense | 51 | 52 | 53 | 54 | 55 | 56 | 57;

export type WeaponTier8Attack = WeaponTier7Attack | 58 | 59 | 60 | 61 | 62 | 63 | 64;
export type WeaponTier8Defense = WeaponTier7Defense | 58 | 59 | 60 | 61 | 62 | 63 | 64;

export type WeaponTier9Attack = WeaponTier8Attack | 65 | 66 | 67 | 68 | 69 | 70 | 71;
export type WeaponTier9Defense = WeaponTier8Defense | 65 | 66 | 67 | 68 | 69 | 70 | 71;

export type WeaponTier10Attack = WeaponTier9Attack | 72 | 73 | 74 | 75 | 76 | 77 | 78;
export type WeaponTier10Defense = WeaponTier9Defense | 72 | 73 | 74 | 75 | 76 | 77 | 78;

export type WeaponTier11Attack = WeaponTier10Attack | 79 | 80 | 81 | 82 | 83 | 84 | 85;
export type WeaponTier11Defense = WeaponTier10Defense | 79 | 80 | 81 | 82 | 83 | 84 | 85;

export type WeaponTier12Attack = WeaponTier11Attack | 86 | 87 | 88 | 89 | 90 | 91 | 92;
export type WeaponTier12Defense = WeaponTier11Defense | 86 | 87 | 88 | 89 | 90 | 91 | 92;

export type WeaponTier13Attack = WeaponTier12Attack | 93 | 94 | 95 | 96 | 97 | 98 | 99;
export type WeaponTier13Defense = WeaponTier12Defense | 93 | 94 | 95 | 96 | 97 | 98 | 99;

export type WeaponTier14Attack = WeaponTier13Attack | 100 | 101 | 102 | 103 | 104 | 105 | 106;
export type WeaponTier14Defense = WeaponTier13Defense | 100 | 101 | 102 | 103 | 104 | 105 | 106;

export type WeaponTier15Attack = WeaponTier14Attack | 107 | 108 | 109 | 110 | 111 | 112 | 113;
export type WeaponTier15Defense = WeaponTier14Defense | 107 | 108 | 109 | 110 | 111 | 112 | 113;

export type WeaponTier16Attack = WeaponTier15Attack | 114 | 115 | 116 | 117 | 118 | 119 | 120;
export type WeaponTier16Defense = WeaponTier15Defense | 114 | 115 | 116 | 117 | 118 | 119 | 120;

export type WeaponTier17Attack = WeaponTier16Attack | 121 | 122 | 123 | 124 | 125 | 126 | 127;
export type WeaponTier17Defense = WeaponTier16Defense | 121 | 122 | 123 | 124 | 125 | 126 | 127;

export type WeaponTier18Attack = WeaponTier17Attack | 128 | 129 | 130 | 131 | 132 | 133 | 134;
export type WeaponTier18Defense = WeaponTier17Defense | 128 | 129 | 130 | 131 | 132 | 133 | 134;

export interface IEquippableMeleeTier0WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 0;
  attack: WeaponTier0Attack;
  defense: WeaponTier0Defense;
}

export interface IEquippableMeleeTier1WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 1;
  attack: WeaponTier1Attack;
  defense: WeaponTier1Defense;
}

export interface IEquippableMeleeTier2WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 2;
  attack: WeaponTier2Attack;
  defense: WeaponTier2Defense;
}

export interface IEquippableMeleeTier3WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 3;
  attack: WeaponTier3Attack;
  defense: WeaponTier3Defense;
}

export interface IEquippableMeleeTier4WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 4;
  attack: WeaponTier4Attack;
  defense: WeaponTier4Defense;
}

export interface IEquippableMeleeTier5WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 5;
  attack: WeaponTier5Attack;
  defense: WeaponTier5Defense;
}

export interface IEquippableMeleeTier6WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 6;
  attack: WeaponTier6Attack;
  defense: WeaponTier6Defense;
}

export interface IEquippableMeleeTier7WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 7;
  attack: WeaponTier7Attack;
  defense: WeaponTier7Defense;
}

export interface IEquippableMeleeTier8WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 8;
  attack: WeaponTier8Attack;
  defense: WeaponTier8Defense;
}

export interface IEquippableMeleeTier9WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 9;
  attack: WeaponTier9Attack;
  defense: WeaponTier9Defense;
}

export interface IEquippableMeleeTier10WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 10;
  attack: WeaponTier10Attack;
  defense: WeaponTier10Defense;
}

export interface IEquippableMeleeTier11WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 11;
  attack: WeaponTier11Attack;
  defense: WeaponTier11Defense;
}

export interface IEquippableMeleeTier12WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 12;
  attack: WeaponTier12Attack;
  defense: WeaponTier12Defense;
}

export interface IEquippableMeleeTier13WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 13;
  attack: WeaponTier13Attack;
  defense: WeaponTier13Defense;
}

export interface IEquippableMeleeTier14WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 14;
  attack: WeaponTier14Attack;
  defense: WeaponTier14Defense;
}

export interface IEquippableMeleeTier15WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 15;
  attack: WeaponTier15Attack;
  defense: WeaponTier15Defense;
}
export interface IEquippableMeleeTier16WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 16;
  attack: WeaponTier16Attack;
  defense: WeaponTier16Defense;
}

export interface IEquippableMeleeTier17WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 17;
  attack: WeaponTier17Attack;
  defense: WeaponTier17Defense;
}

export interface IEquippableMeleeTier18WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 18;
  attack: WeaponTier18Attack;
  defense: WeaponTier18Defense;
}

// 2 handed ========================================

export type TwoHandedWeaponTier0Attack = 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16;
export type TwoHandedWeaponTier0Defense = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type TwoHandedWeaponTier1Attack = TwoHandedWeaponTier0Attack | 18 | 20 | 22 | 24 | 26 | 28 | 30;
export type TwoHandedWeaponTier1Defense = TwoHandedWeaponTier0Defense | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export type TwoHandedWeaponTier2Attack = TwoHandedWeaponTier1Attack | 32 | 34 | 36 | 38 | 40 | 42 | 44;
export type TwoHandedWeaponTier2Defense = TwoHandedWeaponTier1Defense | 16 | 17 | 18 | 19 | 20 | 21 | 22;

export type TwoHandedWeaponTier3Attack = TwoHandedWeaponTier2Attack | 46 | 48 | 50 | 52 | 54 | 56 | 58;
export type TwoHandedWeaponTier3Defense = TwoHandedWeaponTier2Defense | 23 | 24 | 25 | 26 | 27 | 28 | 29;

export type TwoHandedWeaponTier4Attack = TwoHandedWeaponTier3Attack | 62 | 64 | 66 | 68 | 70 | 72 | 74;
export type TwoHandedWeaponTier4Defense = TwoHandedWeaponTier3Defense | 30 | 31 | 32 | 33 | 34 | 35 | 36;

export type TwoHandedWeaponTier5Attack = TwoHandedWeaponTier4Attack | 78 | 80 | 82 | 84 | 86 | 88 | 90;
export type TwoHandedWeaponTier5Defense = TwoHandedWeaponTier4Defense | 37 | 38 | 39 | 40 | 41 | 42 | 43;

export type TwoHandedWeaponTier6Attack = TwoHandedWeaponTier5Attack | 94 | 96 | 98 | 100 | 102 | 104 | 106;
export type TwoHandedWeaponTier6Defense = TwoHandedWeaponTier5Defense | 44 | 45 | 46 | 47 | 48 | 49 | 50;

export type TwoHandedWeaponTier7Attack = TwoHandedWeaponTier6Attack | 110 | 112 | 114 | 116 | 118 | 120 | 122;
export type TwoHandedWeaponTier7Defense = TwoHandedWeaponTier6Defense | 51 | 52 | 53 | 54 | 55 | 56 | 57;

export type TwoHandedWeaponTier8Attack = TwoHandedWeaponTier7Attack | 126 | 128 | 130 | 132 | 134 | 136 | 138;
export type TwoHandedWeaponTier8Defense = TwoHandedWeaponTier7Defense | 58 | 59 | 60 | 61 | 62 | 63 | 64;

export type TwoHandedWeaponTier9Attack = TwoHandedWeaponTier8Attack | 142 | 144 | 146 | 148 | 150 | 152 | 154;
export type TwoHandedWeaponTier9Defense = TwoHandedWeaponTier8Defense | 65 | 66 | 67 | 68 | 69 | 70 | 71;

export interface IEquippableTwoHandedTier0WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 0;
  attack: TwoHandedWeaponTier0Attack;
  defense: TwoHandedWeaponTier0Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier1WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 1;
  attack: TwoHandedWeaponTier1Attack;
  defense: TwoHandedWeaponTier1Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier2WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 2;
  attack: TwoHandedWeaponTier2Attack;
  defense: TwoHandedWeaponTier2Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier3WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 3;
  attack: TwoHandedWeaponTier3Attack;
  defense: TwoHandedWeaponTier3Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier4WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 4;
  attack: TwoHandedWeaponTier4Attack;
  defense: TwoHandedWeaponTier4Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier5WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 5;
  attack: TwoHandedWeaponTier5Attack;
  defense: TwoHandedWeaponTier5Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier6WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 6;
  attack: TwoHandedWeaponTier6Attack;
  defense: TwoHandedWeaponTier6Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier7WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 7;
  attack: TwoHandedWeaponTier7Attack;
  defense: TwoHandedWeaponTier7Defense;
  isTwoHanded: true;
}

export interface IEquippableTwoHandedTier8WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 8;
  attack: TwoHandedWeaponTier8Attack;
  defense: TwoHandedWeaponTier8Defense;
  isTwoHanded: true;
}
export interface IEquippableTwoHandedTier9WeaponBlueprint extends IEquippableWeaponBlueprint {
  tier: 9;
  attack: TwoHandedWeaponTier9Attack;
  defense: TwoHandedWeaponTier9Defense;
  isTwoHanded: true;
}

// Ranged ========================================

type Tier0AmmoKeys =
  | [RangedWeaponsBlueprint.Arrow | RangedWeaponsBlueprint.Stone | RangedWeaponsBlueprint.WoodenArrow]
  | [RangedWeaponsBlueprint.Bolt];
type Tier1AmmoKeys =
  | [RangedWeaponsBlueprint.Arrow, RangedWeaponsBlueprint.IronArrow]
  | [RangedWeaponsBlueprint.Bolt, RangedWeaponsBlueprint.ElvenBolt];
type Tier2AmmoKeys =
  | Tier1AmmoKeys
  | [RangedWeaponsBlueprint.Arrow, RangedWeaponsBlueprint.IronArrow, RangedWeaponsBlueprint.FrostArrow];
type Tier3AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.FrostArrow
    ]
  | [RangedWeaponsBlueprint.Bolt, RangedWeaponsBlueprint.ElvenBolt, RangedWeaponsBlueprint.FireBolt];
type Tier4AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt
    ];

type Tier5AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt
    ];

type Tier6AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt
    ];

type Tier7AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt
    ];

type Tier8AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt,
      RangedWeaponsBlueprint.CursedBolt
    ];

type Tier9AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt,
      RangedWeaponsBlueprint.CursedBolt
    ];

type Tier10AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow,
      RangedWeaponsBlueprint.HeartseekerArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt,
      RangedWeaponsBlueprint.CursedBolt
    ];

type Tier11AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow,
      RangedWeaponsBlueprint.HeartseekerArrow,
      RangedWeaponsBlueprint.SeekerArrow,
      RangedWeaponsBlueprint.CrystallineArrow,
      RangedWeaponsBlueprint.MysticMeadowArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt,
      RangedWeaponsBlueprint.CursedBolt
    ];

type Tier12AmmoKeys =
  | [
      RangedWeaponsBlueprint.Arrow,
      RangedWeaponsBlueprint.IronArrow,
      RangedWeaponsBlueprint.PoisonArrow,
      RangedWeaponsBlueprint.ShockArrow,
      RangedWeaponsBlueprint.GoldenArrow,
      RangedWeaponsBlueprint.EmeraldArrow,
      RangedWeaponsBlueprint.CrimsonArrow,
      RangedWeaponsBlueprint.WardenArrow,
      RangedWeaponsBlueprint.SunflareArrow,
      RangedWeaponsBlueprint.EarthArrow,
      RangedWeaponsBlueprint.SilvermoonArrow,
      RangedWeaponsBlueprint.HeartseekerArrow,
      RangedWeaponsBlueprint.SeekerArrow,
      RangedWeaponsBlueprint.CrystallineArrow,
      RangedWeaponsBlueprint.MysticMeadowArrow,
      RangedWeaponsBlueprint.PlasmaPierceArrow
    ]
  | [
      RangedWeaponsBlueprint.Bolt,
      RangedWeaponsBlueprint.ElvenBolt,
      RangedWeaponsBlueprint.FireBolt,
      RangedWeaponsBlueprint.CorruptionBolt,
      RangedWeaponsBlueprint.GossamerBolt,
      RangedWeaponsBlueprint.CursedBolt
    ];

export interface IEquippableRangedTier0WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 0;
  attack: WeaponTier1Attack;
  requiredAmmoKeys: Tier0AmmoKeys;
}

export interface IEquippableRangedTier1WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 1;
  attack: WeaponTier2Attack;
  requiredAmmoKeys: Tier1AmmoKeys;
}

export interface IEquippableRangedTier2WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 2;
  attack: WeaponTier3Attack;
  requiredAmmoKeys: Tier2AmmoKeys;
}

export interface IEquippableRangedTier3WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 3;
  attack: WeaponTier4Attack;
  requiredAmmoKeys: Tier3AmmoKeys;
}

export interface IEquippableRangedTier4WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 4;
  attack: WeaponTier5Attack;
  requiredAmmoKeys: Tier4AmmoKeys;
}

export interface IEquippableRangedTier5WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 5;
  attack: WeaponTier6Attack;
  requiredAmmoKeys: Tier5AmmoKeys;
}
export interface IEquippableRangedTier6WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 6;
  attack: WeaponTier7Attack;
  requiredAmmoKeys: Tier6AmmoKeys;
}
export interface IEquippableRangedTier7WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 7;
  attack: WeaponTier8Attack;
  requiredAmmoKeys: Tier7AmmoKeys;
}

export interface IEquippableRangedTier8WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 8;
  attack: WeaponTier9Attack;
  requiredAmmoKeys: Tier8AmmoKeys;
}

export interface IEquippableRangedTier9WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 9;
  attack: WeaponTier10Attack;
  requiredAmmoKeys: Tier9AmmoKeys;
}

export interface IEquippableRangedTier10WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 10;
  attack: WeaponTier11Attack;
  requiredAmmoKeys: Tier10AmmoKeys;
}

export interface IEquippableRangedTier11WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 11;
  attack: WeaponTier12Attack;
  requiredAmmoKeys: Tier11AmmoKeys;
}

export interface IEquippableRangedTier12WeaponBlueprint extends IEquippableRangedWeaponTwoHandedBlueprint {
  tier: 12;
  attack: WeaponTier13Attack;
  requiredAmmoKeys: Tier12AmmoKeys;
}

export interface IEquippableOneHandedRangedTier0WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 0;
  attack: WeaponTier0Attack;
}

export interface IEquippableOneHandedRangedTier1WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 1;
  attack: WeaponTier1Attack;
}

export interface IEquippableOneHandedRangedTier2WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 2;
  attack: WeaponTier2Attack;
}

export interface IEquippableOneHandedRangedTier3WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 3;
  attack: WeaponTier3Attack;
}

export interface IEquippableOneHandedRangedTier4WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 4;
  attack: WeaponTier4Attack;
}

export interface IEquippableOneHandedRangedTier5WeaponBlueprint extends IEquippableRangedWeaponOneHandedBlueprint {
  tier: 5;
  attack: WeaponTier5Attack;
}

// Ammo ========================================

export interface IEquippableAmmoTier0Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 0;
  attack: WeaponTier0Attack;
}

export interface IEquippableAmmoTier1Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 1;
  attack: WeaponTier1Attack;
}

export interface IEquippableAmmoTier2Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 2;
  attack: WeaponTier2Attack;
}

export interface IEquippableAmmoTier3Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 3;
  attack: WeaponTier3Attack;
}

export interface IEquippableAmmoTier4Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 4;
  attack: WeaponTier4Attack;
}

export interface IEquippableAmmoTier5Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 5;
  attack: WeaponTier5Attack;
}

export interface IEquippableAmmoTier6Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 6;
  attack: WeaponTier6Attack;
}

export interface IEquippableAmmoTier7Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 7;
  attack: WeaponTier7Attack;
}

export interface IEquippableAmmoTier8Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 8;
  attack: WeaponTier8Attack;
}

export interface IEquippableAmmoTier9Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 9;
  attack: WeaponTier9Attack;
}

export interface IEquippableAmmoTier10Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 10;
  attack: WeaponTier10Attack;
}

export interface IEquippableAmmoTier11Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 11;
  attack: WeaponTier11Attack;
}

export interface IEquippableAmmoTier12Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 12;
  attack: WeaponTier12Attack;
}

export interface IEquippableAmmoTier13Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 13;
  attack: WeaponTier13Attack;
}

export interface IEquippableAmmoTier14Blueprint extends IEquippableRangedAmmoBlueprint {
  tier: 14;
  attack: WeaponTier14Attack;
}

// Staffs ========================================

export interface IEquippableTwoHandedStaffTier0WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 0;
  attack: WeaponTier0Attack;
  defense: WeaponTier0Defense;
}

export interface IEquippableTwoHandedStaffTier1WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 1;
  attack: WeaponTier1Attack;
  defense: WeaponTier1Defense;
}

export interface IEquippableTwoHandedStaffTier2WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 2;
  attack: WeaponTier2Attack;
  defense: WeaponTier2Defense;
}

export interface IEquippableTwoHandedStaffTier3WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 3;
  attack: WeaponTier3Attack;
  defense: WeaponTier3Defense;
}

export interface IEquippableTwoHandedStaffTier4WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 4;
  attack: WeaponTier4Attack;
  defense: WeaponTier4Defense;
}

export interface IEquippableTwoHandedStaffTier5WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 5;
  attack: WeaponTier5Attack;
  defense: WeaponTier5Defense;
}

export interface IEquippableTwoHandedStaffTier6WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 6;
  attack: WeaponTier6Attack;
  defense: WeaponTier6Defense;
}

export interface IEquippableTwoHandedStaffTier7WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 7;
  attack: WeaponTier7Attack;
  defense: WeaponTier7Defense;
}
export interface IEquippableTwoHandedStaffTier8WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 8;
  attack: WeaponTier8Attack;
  defense: WeaponTier8Defense;
}

export interface IEquippableTwoHandedStaffTier9WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 9;
  attack: WeaponTier9Attack;
  defense: WeaponTier9Defense;
}

export interface IEquippableTwoHandedStaffTier10WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 10;
  attack: WeaponTier10Attack;
  defense: WeaponTier10Defense;
}

export interface IEquippableTwoHandedStaffTier11WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 11;
  attack: WeaponTier11Attack;
  defense: WeaponTier11Defense;
}

export interface IEquippableTwoHandedStaffTier12WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 12;
  attack: WeaponTier12Attack;
  defense: WeaponTier12Defense;
}
export interface IEquippableTwoHandedStaffTier13WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 13;
  attack: WeaponTier13Attack;
  defense: WeaponTier13Defense;
}

export interface IEquippableTwoHandedStaffTier14WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 14;
  attack: WeaponTier14Attack;
  defense: WeaponTier14Defense;
}

export interface IEquippableTwoHandedStaffTier15WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 15;
  attack: WeaponTier15Attack;
  defense: WeaponTier15Defense;
}

export interface IEquippableTwoHandedStaffTier16WeaponBlueprint extends IEquippableStaffBlueprint {
  tier: 16;
  attack: WeaponTier16Attack;
  defense: WeaponTier16Defense;
}

// Armors ========================================
export type Tier0ArmorDefense = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Tier1ArmorDefense = Tier0ArmorDefense | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type Tier2ArmorDefense = Tier1ArmorDefense | 16 | 17 | 18 | 19 | 20 | 21 | 22;
export type Tier3ArmorDefense = Tier2ArmorDefense | 23 | 24 | 25 | 26 | 27 | 28 | 29;
export type Tier4ArmorDefense = Tier3ArmorDefense | 30 | 31 | 32 | 33 | 34 | 35 | 36;
export type Tier5ArmorDefense = Tier4ArmorDefense | 37 | 38 | 39 | 40 | 41 | 42 | 43;
export type Tier6ArmorDefense = Tier5ArmorDefense | 44 | 45 | 46 | 47 | 48 | 49 | 50;

export type Tier7ArmorDefense = Tier5ArmorDefense | 51 | 52 | 53 | 54 | 55 | 56 | 57;

export type Tier8ArmorDefense = Tier5ArmorDefense | 58 | 59 | 60 | 61 | 62 | 63 | 64;

export type Tier9ArmorDefense = Tier5ArmorDefense | 65 | 66 | 67 | 68 | 69 | 70 | 71;

export type Tier10ArmorDefense = Tier5ArmorDefense | 72 | 73 | 74 | 75 | 76 | 77 | 78;

export interface IEquippableArmorTier0Blueprint extends IEquippableArmorBlueprint {
  tier: 0;
  defense: Tier0ArmorDefense;
}

export interface IEquippableArmorTier1Blueprint extends IEquippableArmorBlueprint {
  tier: 1;
  defense: Tier1ArmorDefense;
}

export interface IEquippableArmorTier2Blueprint extends IEquippableArmorBlueprint {
  tier: 2;
  defense: Tier2ArmorDefense;
}

export interface IEquippableArmorTier3Blueprint extends IEquippableArmorBlueprint {
  tier: 3;
  defense: Tier3ArmorDefense;
}

export interface IEquippableArmorTier4Blueprint extends IEquippableArmorBlueprint {
  tier: 4;
  defense: Tier4ArmorDefense;
}

export interface IEquippableArmorTier5Blueprint extends IEquippableArmorBlueprint {
  tier: 5;
  defense: Tier5ArmorDefense;
}

export interface IEquippableArmorTier6Blueprint extends IEquippableArmorBlueprint {
  tier: 6;
  defense: Tier6ArmorDefense;
}

export interface IEquippableArmorTier7Blueprint extends IEquippableArmorBlueprint {
  tier: 7;
  defense: Tier7ArmorDefense;
}

export interface IEquippableArmorTier8Blueprint extends IEquippableArmorBlueprint {
  tier: 8;
  defense: Tier8ArmorDefense;
}

export interface IEquippableArmorTier9Blueprint extends IEquippableArmorBlueprint {
  tier: 9;
  defense: Tier9ArmorDefense;
}

export interface IEquippableArmorTier10Blueprint extends IEquippableArmorBlueprint {
  tier: 10;
  defense: Tier10ArmorDefense;
}

// Light Armor ========================================

export type LightArmorTier0Defense = 0 | 1 | 2 | 3 | 4;
export type LightArmorTier1Defense = LightArmorTier0Defense | 5 | 6 | 7;
export type LightArmorTier2Defense = LightArmorTier1Defense | 8 | 9 | 10;
export type LightArmorTier3Defense = LightArmorTier2Defense | 11 | 12 | 13 | 14 | 15 | 16;
export type LightArmorTier4Defense = LightArmorTier3Defense | 17 | 18 | 19 | 20 | 21 | 22;
export type LightArmorTier5Defense = LightArmorTier4Defense | 23 | 24 | 25 | 26 | 27 | 28;
export type LightArmorTier6Defense = LightArmorTier5Defense | 29 | 30 | 31 | 32 | 33 | 34;
export type LightArmorTier7Defense = LightArmorTier6Defense | 35 | 36 | 37 | 38 | 39 | 40;
export type LightArmorTier8Defense = LightArmorTier7Defense | 41 | 42 | 43 | 44 | 45 | 46;
export type LightArmorTier9Defense = LightArmorTier8Defense | 47 | 48 | 49 | 50 | 51 | 50;
export type LightArmorTier10Defense = LightArmorTier9Defense | 53 | 54 | 55 | 56 | 57 | 58;
export type LightArmorTier11Defense = LightArmorTier10Defense | 59 | 60 | 61 | 62 | 63 | 64;
export type LightArmorTier12Defense = LightArmorTier11Defense | 65 | 66 | 67 | 68 | 69 | 70;
export type LightArmorTier13Defense = LightArmorTier12Defense | 71 | 72 | 73 | 74 | 75 | 76;

export interface IEquippableLightArmorTier0Blueprint extends IEquippableArmorBlueprint {
  tier: 0;
  defense: LightArmorTier0Defense;
}

export interface IEquippableLightArmorTier1Blueprint extends IEquippableArmorBlueprint {
  tier: 1;
  defense: LightArmorTier1Defense;
}

export interface IEquippableLightArmorTier2Blueprint extends IEquippableArmorBlueprint {
  tier: 2;
  defense: LightArmorTier2Defense;
}

export interface IEquippableLightArmorTier3Blueprint extends IEquippableArmorBlueprint {
  tier: 3;
  defense: LightArmorTier3Defense;
}

export interface IEquippableLightArmorTier4Blueprint extends IEquippableArmorBlueprint {
  tier: 4;
  defense: LightArmorTier4Defense;
}

export interface IEquippableLightArmorTier5Blueprint extends IEquippableArmorBlueprint {
  tier: 5;
  defense: LightArmorTier5Defense;
}

export interface IEquippableLightArmorTier6Blueprint extends IEquippableArmorBlueprint {
  tier: 6;
  defense: LightArmorTier6Defense;
}
export interface IEquippableLightArmorTier7Blueprint extends IEquippableArmorBlueprint {
  tier: 7;
  defense: LightArmorTier7Defense;
}

export interface IEquippableLightArmorTier8Blueprint extends IEquippableArmorBlueprint {
  tier: 8;
  defense: LightArmorTier8Defense;
}
export interface IEquippableLightArmorTier9Blueprint extends IEquippableArmorBlueprint {
  tier: 9;
  defense: LightArmorTier9Defense;
}
export interface IEquippableLightArmorTier10Blueprint extends IEquippableArmorBlueprint {
  tier: 10;
  defense: LightArmorTier10Defense;
}
export interface IEquippableLightArmorTier11Blueprint extends IEquippableArmorBlueprint {
  tier: 11;
  defense: LightArmorTier11Defense;
}
export interface IEquippableLightArmorTier12Blueprint extends IEquippableArmorBlueprint {
  tier: 12;
  defense: LightArmorTier12Defense;
}
export interface IEquippableLightArmorTier13Blueprint extends IEquippableArmorBlueprint {
  tier: 13;
  defense: LightArmorTier13Defense;
}

// Book ========================================
export interface IEquippableBookTier0Blueprint extends IEquippableItemBlueprint {
  tier: 0;
}

export interface IEquippableBookTier1Blueprint extends IEquippableItemBlueprint {
  tier: 1;
}

export interface IEquippableBookTier2Blueprint extends IEquippableItemBlueprint {
  tier: 2;
}

export interface IEquippableBookTier3Blueprint extends IEquippableItemBlueprint {
  tier: 3;
}

export interface IEquippableBookTier4Blueprint extends IEquippableItemBlueprint {
  tier: 4;
}

export interface IEquippableBookTier5Blueprint extends IEquippableItemBlueprint {
  tier: 5;
}

export interface IEquippableBookTier6Blueprint extends IEquippableItemBlueprint {
  tier: 6;
}

export interface IEquippableBookTier7Blueprint extends IEquippableItemBlueprint {
  tier: 7;
}

export type GemTier0Attack = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GemTier1Attack = GemTier0Attack | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type GemTier2Attack = GemTier1Attack | 16 | 17 | 18 | 19 | 20 | 21 | 22;
export type GemTier3Attack = GemTier2Attack | 23 | 24 | 25 | 26 | 27 | 28 | 29;
export type GemTier4Attack = GemTier3Attack | 30 | 31 | 32 | 33 | 34 | 35 | 36;
export type GemTier5Attack = GemTier4Attack | 37 | 38 | 39 | 40 | 41 | 42 | 43;
export type GemTier6Attack = GemTier5Attack | 44 | 45 | 46 | 47 | 48 | 49 | 50;
export type GemTier7Attack = GemTier6Attack | 51 | 52 | 53 | 54 | 55 | 56 | 57;
export type GemTier8Attack = GemTier7Attack | 58 | 59 | 60 | 61 | 62 | 63 | 64;
export type GemTier9Attack = GemTier8Attack | 65 | 66 | 67 | 68 | 69 | 70 | 71;
export type GemTier10Attack = GemTier9Attack | 72 | 73 | 74 | 75 | 76 | 77 | 78;

export type GemTier0Defense = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GemTier1Defense = GemTier0Defense | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type GemTier2Defense = GemTier1Defense | 16 | 17 | 18 | 19 | 20 | 21 | 22;
export type GemTier3Defense = GemTier2Defense | 23 | 24 | 25 | 26 | 27 | 28 | 29;
export type GemTier4Defense = GemTier3Defense | 30 | 31 | 32 | 33 | 34 | 35 | 36;
export type GemTier5Defense = GemTier4Defense | 37 | 38 | 39 | 40 | 41 | 42 | 43;
export type GemTier6Defense = GemTier5Defense | 44 | 45 | 46 | 47 | 48 | 49 | 50;
export type GemTier7Defense = GemTier6Defense | 51 | 52 | 53 | 54 | 55 | 56 | 57;
export type GemTier8Defense = GemTier7Defense | 58 | 59 | 60 | 61 | 62 | 63 | 64;
export type GemTier9Defense = GemTier8Defense | 65 | 66 | 67 | 68 | 69 | 70 | 71;
export type GemTier10Defense = GemTier9Defense | 72 | 73 | 74 | 75 | 76 | 77 | 78;

export type GemTier0EffectChance = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type GemTier1EffectChance = 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
export type GemTier2EffectChance = 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24;
export type GemTier3EffectChance = 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
export type GemTier4EffectChance = 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;
export type GemTier5EffectChance = 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48;
export type GemTier6EffectChance = 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56;
export type GemTier7EffectChance = 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64;
export type GemTier8EffectChance = 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72;
export type GemTier9EffectChance = 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80;
export type GemTier10EffectChance = 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88;

export type GemTier0BasePrice = 2000 | 4000 | 6000 | 8000 | 10000;
export type GemTier1BasePrice = 12000 | 14000 | 16000 | 18000 | 20000;
export type GemTier2BasePrice = 22000 | 24000 | 26000 | 28000 | 30000;
export type GemTier3BasePrice = 32000 | 34000 | 36000 | 38000 | 40000;
export type GemTier4BasePrice = 42000 | 44000 | 46000 | 48000 | 50000;
export type GemTier5BasePrice = 52000 | 54000 | 56000 | 58000 | 60000;
export type GemTier6BasePrice = 62000 | 64000 | 66000 | 68000 | 70000;
export type GemTier7BasePrice = 72000 | 74000 | 76000 | 78000 | 80000;
export type GemTier8BasePrice = 82000 | 84000 | 86000 | 88000 | 90000;
export type GemTier9BasePrice = 92000 | 94000 | 96000 | 98000 | 100000;
export type GemTier10BasePrice = 102000 | 104000 | 106000 | 108000 | 110000;

export interface IItemGemTier0Blueprint extends IItemGem {
  tier: 0;
  gemStatBuff: {
    attack: GemTier0Attack;
    defense: GemTier0Defense;
  };
  gemEntityEffectChance: GemTier0EffectChance;
  basePrice: GemTier0BasePrice;
}

export interface IItemGemTier1Blueprint extends IItemGem {
  tier: 1;
  gemStatBuff: {
    attack: GemTier1Attack;
    defense: GemTier1Defense;
  };
  gemEntityEffectChance: GemTier1EffectChance;
  basePrice: GemTier1BasePrice;
}

export interface IItemGemTier2Blueprint extends IItemGem {
  tier: 2;
  gemStatBuff: {
    attack: GemTier2Attack;
    defense: GemTier2Defense;
  };
  gemEntityEffectChance: GemTier2EffectChance;
  basePrice: GemTier2BasePrice;
}

export interface IItemGemTier3Blueprint extends IItemGem {
  tier: 3;
  gemStatBuff: {
    attack: GemTier3Attack;
    defense: GemTier3Defense;
  };
  gemEntityEffectChance: GemTier3EffectChance;
  basePrice: GemTier3BasePrice;
}

export interface IItemGemTier4Blueprint extends IItemGem {
  tier: 4;
  gemStatBuff: {
    attack: GemTier4Attack;
    defense: GemTier4Defense;
  };
  gemEntityEffectChance: GemTier4EffectChance;
  basePrice: GemTier4BasePrice;
}

export interface IItemGemTier5Blueprint extends IItemGem {
  tier: 5;
  gemStatBuff: {
    attack: GemTier5Attack;
    defense: GemTier5Defense;
  };
  gemEntityEffectChance: GemTier5EffectChance;
  basePrice: GemTier5BasePrice;
}

export interface IItemGemTier6Blueprint extends IItemGem {
  tier: 6;
  gemStatBuff: {
    attack: GemTier6Attack;
    defense: GemTier6Defense;
  };
  gemEntityEffectChance: GemTier6EffectChance;
  basePrice: GemTier6BasePrice;
}

export interface IItemGemTier7Blueprint extends IItemGem {
  tier: 7;
  gemStatBuff: {
    attack: GemTier7Attack;
    defense: GemTier7Defense;
  };
  gemEntityEffectChance: GemTier7EffectChance;
  basePrice: GemTier7BasePrice;
}

export interface IItemGemTier8Blueprint extends IItemGem {
  tier: 8;
  gemStatBuff: {
    attack: GemTier8Attack;
    defense: GemTier8Defense;
  };
  gemEntityEffectChance: GemTier8EffectChance;
  basePrice: GemTier8BasePrice;
}

export interface IItemGemTier9Blueprint extends IItemGem {
  tier: 9;
  gemStatBuff: {
    attack: GemTier9Attack;
    defense: GemTier9Defense;
  };
  gemEntityEffectChance: GemTier9EffectChance;
  basePrice: GemTier9BasePrice;
}

export interface IItemGemTier10Blueprint extends IItemGem {
  tier: 10;
  gemStatBuff: {
    attack: GemTier10Attack;
    defense: GemTier10Defense;
  };
  gemEntityEffectChance: GemTier10EffectChance;
  basePrice: GemTier10BasePrice;
}
