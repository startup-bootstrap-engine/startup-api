import { FIREBASE_CONFIG_PATH } from "@providers/constants/PathConstants";

import { appEnv } from "@providers/config/env";
import firebaseAdmin from "firebase-admin";

const initializeFirebaseApp = (): firebaseAdmin.app.App => {
  try {
    const serviceAccount = require(`${FIREBASE_CONFIG_PATH}/firebase-admin-keyfile.json`);

    const firebaseConfig = {
      credential: firebaseAdmin.credential.cert(serviceAccount),
      databaseURL: appEnv.database.FB_DB_PATH,
    };

    // Check if databaseURL is present
    if (!firebaseConfig.databaseURL) {
      console.error("Error: Firebase Database URL is missing in the configuration.");
      throw new Error("Firebase Database URL is required.");
    }

    return firebaseAdmin.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw error; // Re-throw the error
  }
};

const firebaseAdminApp = initializeFirebaseApp();

export { firebaseAdminApp };
