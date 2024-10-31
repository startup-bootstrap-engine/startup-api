import { AppleOAuthHelper } from "@providers/auth/AppleOAuthHelper";
import { GoogleOAuthHelper } from "@providers/auth/GoogleOauthHelper";
import { container, inMemoryHashTable, redisManager } from "@providers/inversify/container";
import { app } from "@providers/server/app";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

let mongoServer: MongoMemoryServer;

// Set up Apple OAuth mock
const mockAppleOAuthHelper = {
  verifyIdentityToken: jest.fn().mockImplementation((identityToken: string) => {
    // Mock successful verification for test tokens
    if (identityToken === "valid-identity-token") {
      return Promise.resolve({
        iss: "https://appleid.apple.com",
        aud: "com.blueship.mobile",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        sub: "apple-user-id-123", // Must match user ID in test data
        email: "test@example.com",
        email_verified: "true",
        auth_time: Math.floor(Date.now() / 1000),
        nonce_supported: true,
        real_user_status: 2,
      });
    }
    return Promise.resolve(null);
  }),
};

// Set up Google OAuth mock
const mockGoogleOAuthHelper = {
  validateIdToken: jest.fn().mockImplementation((idToken: string) => {
    if (idToken === "valid-google-id-token") {
      return Promise.resolve("google-user-id-123");
    }
    return Promise.resolve(false);
  }),

  getGoogleUserFromIdToken: jest.fn().mockImplementation((idToken: string) => {
    if (idToken === "valid-google-id-token") {
      return Promise.resolve({
        sub: "google-user-id-123",
        email: "test@example.com",
        email_verified: true,
        name: "Test User",
        given_name: "Test",
        family_name: "User",
        picture: "https://example.com/photo.jpg",
        locale: "en",
      });
    }
    return Promise.resolve(undefined);
  }),

  getGoogleUser: jest.fn().mockImplementation((code: string) => {
    if (code === "valid-google-auth-code") {
      return Promise.resolve({
        id: "google-user-id-123",
        email: "test@example.com",
        verified_email: true,
        name: "Test User",
        given_name: "Test",
        family_name: "User",
        picture: "https://example.com/photo.jpg",
        locale: "en",
      });
    }
    throw new Error("Invalid code");
  }),

  getAccessTokenFromCode: jest.fn().mockImplementation((code: string) => {
    if (code === "valid-google-auth-code") {
      return Promise.resolve({
        access_token: "google-access-token",
        id_token: "google-id-token",
        expires_in: 3600,
        token_type: "Bearer",
        scope: "profile email",
        refresh_token: "google-refresh-token",
      });
    }
    throw new Error("Invalid code");
  }),

  urlGoogle: jest.fn().mockImplementation(() => {
    return Promise.resolve(
      "https://accounts.google.com/o/oauth2/v2/auth?" +
        "client_id=mock-client-id" +
        "&redirect_uri=http://localhost:3000/auth/google/redirect" +
        "&response_type=code" +
        "&scope=profile email" +
        "&access_type=offline" +
        "&prompt=consent"
    );
  }),
};

// Bind mocks to container
container.unbind(AppleOAuthHelper);
container.bind(AppleOAuthHelper).toConstantValue(mockAppleOAuthHelper as any);

container.unbind(GoogleOAuthHelper);
container.bind(GoogleOAuthHelper).toConstantValue(mockGoogleOAuthHelper as any);

beforeAll(async () => {
  // Force disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Create new mongo memory server
  mongoServer = await MongoMemoryServer.create();

  // Connect to the in-memory database
  await mongoose.connect(mongoServer.getUri(), {
    dbName: "test-database",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  // Initialize other services
  await redisManager.connect();
  await inMemoryHashTable.init();
});

afterAll(async () => {
  // Clean up database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }

  // Stop mongo memory server
  if (mongoServer) {
    await mongoServer.stop({
      doCleanup: true,
      force: true,
    });
  }

  // Clean up other services
  container.unload();
  await redisManager.client?.flushall();
});

beforeEach(async () => {
  // Clear database before each test
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
  }
});

export const testRequest = request(app);
