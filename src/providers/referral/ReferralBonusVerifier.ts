import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RSAEncryption } from "@providers/encryption/RSAEncryption";
import dayjs from "dayjs";
import { provide } from "inversify-binding-decorators";

@provide(ReferralBonusVerifier)
export class ReferralBonusVerifier {
  constructor(private inMemoryHashTable: InMemoryHashTable, private rsaEncryption: RSAEncryption) {}

  public async wasReferralBonusAlreadyAddedToday(deviceFingerprint: string): Promise<boolean> {
    const today = dayjs().format("YYYY-MM-DD");
    const dailyRewardDeviceControl = await this.inMemoryHashTable.get("referral-bonus-daily-reward", today);

    deviceFingerprint = this.getDecryptedDeviceFingerprint(deviceFingerprint)!;

    if (dailyRewardDeviceControl && dailyRewardDeviceControl[deviceFingerprint]) {
      return true;
    }

    const updatedDailyRewardDeviceControl = {
      ...dailyRewardDeviceControl,
      [deviceFingerprint]: true,
    };

    await this.inMemoryHashTable.set("referral-bonus-daily-reward", today, updatedDailyRewardDeviceControl);

    return false;
  }

  public async wasReferralBonusAlreadyAdded(deviceFingerprint: string): Promise<boolean> {
    try {
      const wasDeviceFingerprintAlreadyUsed = await this.wasDeviceFingerprintAlreadyUsed(deviceFingerprint);

      if (wasDeviceFingerprintAlreadyUsed) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return true;
    }
  }

  private getDecryptedDeviceFingerprint(encryptedDeviceFingerprint: string): string | undefined {
    const decryptedDeviceFingerprint = this.rsaEncryption.decryptWithPrivateKey(encryptedDeviceFingerprint);

    if (!decryptedDeviceFingerprint) {
      throw new Error("Failed to decrypt device fingerprint");
    }

    console.log(`Decrypted Device fingerprint: ${decryptedDeviceFingerprint}`);

    return decryptedDeviceFingerprint;
  }

  private async wasDeviceFingerprintAlreadyUsed(deviceFingerprint: string): Promise<boolean> {
    if (!deviceFingerprint) {
      throw new Error("Invalid or missing device fingerprint");
    }

    deviceFingerprint = this.getDecryptedDeviceFingerprint(deviceFingerprint)!;

    console.log(`Decrypted Device fingerprint: ${deviceFingerprint}`);

    if (!this.isValidFingerprint(Number(deviceFingerprint))) {
      throw new Error(`Invalid device fingerprint pattern ${deviceFingerprint}.`);
    }

    const isDeviceFingerprintAdded = Boolean(
      await this.inMemoryHashTable.get("referral-bonus-device-fingerprint", deviceFingerprint)
    );

    if (isDeviceFingerprintAdded) {
      console.log(`Device fingerprint ${deviceFingerprint} already exists`);
      return true;
    }

    console.log(`Device fingerprint: ${deviceFingerprint} does not exist.`);
    await this.inMemoryHashTable.set("referral-bonus-device-fingerprint", deviceFingerprint, true);

    return false;
  }

  private isValidFingerprint(n: number): boolean {
    // Define the limits for 32-bit unsigned integer
    const MIN: number = 0; // Minimum 32-bit unsigned integer
    const MAX: number = 4294967295; // Maximum 32-bit unsigned integer

    // Check if the number is an integer and within the 32-bit unsigned integer range
    if (Number.isInteger(n) && n >= MIN && n <= MAX) {
      return true;
    } else {
      return false;
    }
  }
}
