import { provideSingleton } from "@providers/inversify/provideSingleton";
import firebaseAdmin from "firebase-admin";
import { IDatabaseAdapter } from "../DatabaseTypes";
import { firebaseAdminApp } from "../firebase/FirebaseApp";

@provideSingleton(FirebaseAdapter)
export class FirebaseAdapter implements IDatabaseAdapter {
  private database: firebaseAdmin.database.Database;
  private app: firebaseAdmin.app.App = firebaseAdminApp;

  public initialize(): void {
    if (this.app) {
      this.database = this.app.database();
      console.log("✅ Connected to Firebase Realtime Database (Admin SDK)");
    }
  }

  // eslint-disable-next-line require-await
  public async close(): Promise<void> {
    try {
      await firebaseAdmin.app().delete(); // Properly close the admin app
      console.log("✅ Disconnected from Firebase Realtime Database (Admin SDK)");
    } catch (error) {
      console.error("Error closing Firebase Admin SDK:", error);
      throw error; // Re-throw the error
    }
  }

  public getDatabase(): firebaseAdmin.database.Database | undefined {
    if (!this.database) {
      return;
    }

    return this.database;
  }
}
