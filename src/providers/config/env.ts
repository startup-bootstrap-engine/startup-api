import { SocketTypes } from "@startup-engine/shared";

export const appEnv = {
  general: {
    APP_NAME: process.env.APP_NAME,
    API_SUBDOMAIN: process.env.API_SUBDOMAIN,
    WEB_APP_URL: process.env.WEB_APP_URL,
    TIMEZONE: process.env.TIMEZONE,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    LANGUAGE: process.env.LANGUAGE,
    PHONE_LOCALE: process.env.PHONE_LOCALE,
    APP_URL: process.env.APP_URL,
    API_URL: process.env.API_URL,
    ENV: process.env.ENV,
    SERVER_PORT: process.env.SERVER_PORT,
    SWAGGER_AUTH_TOKEN: process.env.SWAGGER_AUTH_TOKEN,
    FMP_API_KEY: process.env.FMP_API_KEY,

    IS_UNIT_TEST: process.env.JEST_WORKER_ID !== undefined,
    DEBUG_MODE: process.env.DEBUG_MODE === "true",
    DISCORD_TOKEN: process.env.DISCORD_BOT_TOKEN,

    MICROSERVICE_NAME: process.env.MICROSERVICE_NAME,
    IS_MICROSERVICE: process.env.MICROSERVICE_NAME !== undefined,
  },
  analytics: {
    mixpanelToken: process.env.MIXPANEL_TOKEN,
    amplitudeApiKey: process.env.AMPLITUDE_API_KEY,
  },
  externalAPIs: {
    cryptoCompare: process.env.CRYPTO_COMPARE_KEY,
    exchangeRate: process.env.EXCHANGE_RATE_API,
  },
  database: {
    DB_ADAPTER: process.env.DB_ADAPTER,
    FB_DB_PATH: process.env.FB_DB_PATH,
    MONGO_INITDB_DATABASE: process.env.MONGO_INITDB_DATABASE,
    MONGO_HOST_CONTAINER: process.env.MONGO_HOST_CONTAINER,
    MONGO_PORT: process.env.MONGO_PORT,
    MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD,
    REDIS_CONTAINER: process.env.REDIS_CONTAINER,
    REDIS_PORT: Number(process.env.REDIS_PORT),
  },
  encryption: {
    genericHash: process.env.GENERIC_ENCRYPTION_HASH,
    rsaBase64PrivateKey: process.env.RSA_BASE_64_PRIVATE_KEY,
  },
  authentication: {
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
    googleOAuth: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    },
  },
  transactionalEmail: {
    templatesFolder: process.env.TEMPLATES_FOLDER,
    general: {
      GLOBAL_VAR_SENDER_NAME: process.env.GLOBAL_VAR_SENDER_NAME,
      GLOBAL_VAR_COMPANY_NAME_LLC: process.env.GLOBAL_VAR_COMPANY_NAME_LLC,
      GLOBAL_VAR_COMPANY_ADDRESS: process.env.GLOBAL_VAR_COMPANY_ADDRESS,
      GLOBAL_VAR_PRODUCT_NAME: process.env.GLOBAL_VAR_PRODUCT_NAME,
    },
    sendGrid: {
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    },
    sendInBlue: {
      SENDINBLUE_API_KEY: process.env.SENDINBLUE_API_KEY,
    },
  },

  socket: {
    type: process.env.SOCKET_TYPE as unknown as SocketTypes,
    port: {
      SOCKET: Number(process.env.SOCKET_PORT),
    },
  },

  rabbitmq: {
    host: process.env.RABBITMQ_HOST,
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_DEFAULT_USER,
    password: process.env.RABBITMQ_DEFAULT_PASS,
  },
};
