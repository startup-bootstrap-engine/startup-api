import { InMemoryHashTable } from "@providers/database/InMemoryHashTable";
import { RSAEncryption } from "@providers/encryption/RSAEncryption";
import { Request } from "express";
import { provide } from "inversify-binding-decorators";
import requestIp from "request-ip";

@provide(ReferralBonusVerifier)
export class ReferralBonusVerifier {
  constructor(private inMemoryHashTable: InMemoryHashTable, private rsaEncryption: RSAEncryption) {}

  public async isReferralBonusAlreadyAdded(request: Request, deviceFingerprint: string): Promise<boolean> {
    try {
      const clientIp = request.headers["x-forwarded-for"] || requestIp.getClientIp(request);

      const wasRequestIPAlreadyUsed = await this.wasRequestIPAlreadyUsed(clientIp);

      if (wasRequestIPAlreadyUsed) {
        return true;
      }

      const wasDeviceFingerprintAlreadyUsed = await this.wasDeviceFingerprintAlreadyUsed(deviceFingerprint);

      if (wasDeviceFingerprintAlreadyUsed) {
        return true;
      }

      // only lock the IP if the device fingerprint is not already used
      await this.inMemoryHashTable.set("referral-ips-list", clientIp, true);

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

  private async wasRequestIPAlreadyUsed(clientIp: string): Promise<boolean> {
    try {
      if (!clientIp) {
        throw new Error("Invalid or missing client IP");
      }

      const isClientIpAdded = Boolean(await this.inMemoryHashTable.get("referral-ips-list", clientIp));

      if (isClientIpAdded) {
        console.log(`Client IP ${clientIp} already exists`);
        return true;
      }

      console.log(`Client IP ${clientIp} does not exist. Proceeding...`);

      return false;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
