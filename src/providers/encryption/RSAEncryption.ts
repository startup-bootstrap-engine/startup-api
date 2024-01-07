import { appEnv } from "@providers/config/env";
import { provideSingleton } from "@providers/inversify/provideSingleton";
import * as forge from "node-forge";

@provideSingleton(RSAEncryption)
export class RSAEncryption {
  private privateKey: string = appEnv.encryption.rsaPrivateKey!;

  public decryptWithPrivateKey(encryptedData: string): string {
    if (!this.privateKey) throw new Error("Private key not found");

    const privateKeyForge = forge.pki.privateKeyFromPem(this.privateKey);
    const decrypted = privateKeyForge.decrypt(forge.util.decode64(encryptedData), "RSA-OAEP");
    return forge.util.decodeUtf8(decrypted);
  }
}
