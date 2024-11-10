-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('Admin', 'Regular', 'Staff');

-- CreateEnum
CREATE TYPE "AuthFlowEnum" AS ENUM ('Basic', 'GoogleOAuth', 'FacebookOAuth', 'LinkedInOAuth', 'AppleOAuth');

-- CreateEnum
CREATE TYPE "AccountTypeEnum" AS ENUM ('free', 'bronze', 'silver', 'gold', 'ultimate');

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'lara',
    "language" TEXT NOT NULL DEFAULT 'en',
    "notifications" JSONB NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "RoleEnum" NOT NULL DEFAULT 'Regular',
    "authFlow" "AuthFlowEnum" NOT NULL DEFAULT 'Basic',
    "email" TEXT NOT NULL,
    "password" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "salt" TEXT,
    "unsubscribed" BOOLEAN NOT NULL DEFAULT false,
    "refreshTokens" JSONB[],
    "accountType" "AccountTypeEnum" NOT NULL DEFAULT 'free',
    "isManuallyControlledPremiumAccount" BOOLEAN NOT NULL DEFAULT false,
    "pushNotificationToken" TEXT,
    "channel" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ABTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_id_key" ON "UserPreference"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ABTest_id_key" ON "ABTest"("id");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
