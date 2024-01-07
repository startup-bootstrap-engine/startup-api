import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RSAEncryption } from "@providers/encryption/RSAEncryption";
import { provide } from "inversify-binding-decorators";

@provide(ReferralBonusVerifier)
export class ReferralBonusVerifier {
  constructor(private inMemoryHashTable: InMemoryHashTable, private rsaEncryption: RSAEncryption) {}

  public async isReferralBonusAlreadyAdded(deviceFingerprint: string): Promise<boolean> {
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

  private async wasDeviceFingerprintAlreadyUsed(deviceFingerprint: string): Promise<boolean> {
    if (!deviceFingerprint) {
      throw new Error("Invalid or missing device fingerprint");
    }

    console.log(`Encrypted Device fingerprint: ${deviceFingerprint}`);

    const decryptedDeviceFingerprint = this.rsaEncryption.decryptWithPrivateKey(deviceFingerprint);

    if (!decryptedDeviceFingerprint) {
      throw new Error("Failed to decrypt device fingerprint");
    }

    console.log(`Decrypted Device fingerprint: ${decryptedDeviceFingerprint}`);

    deviceFingerprint = decryptedDeviceFingerprint;

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
