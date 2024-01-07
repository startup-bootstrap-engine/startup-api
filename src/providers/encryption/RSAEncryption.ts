import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import { Buffer } from "buffer";
import * as forge from "node-forge";

@provideSingleton(RSAEncryption)
export class RSAEncryption {
  private base64PrivateKey: string = appEnv.encryption.rsaBase64PrivateKey!;

  public decryptWithPrivateKey(encryptedData: string): string {
    if (!this.base64PrivateKey) throw new Error("Private key not found");

    const privateKey = Buffer.from(this.base64PrivateKey, "base64").toString("utf8");

    const privateKeyForge = forge.pki.privateKeyFromPem(privateKey);
    const decrypted = privateKeyForge.decrypt(forge.util.decode64(encryptedData), "RSA-OAEP");
    return forge.util.decodeUtf8(decrypted);
  }
}
