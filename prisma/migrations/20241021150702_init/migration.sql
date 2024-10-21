-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('Admin', 'Regular', 'Staff');

-- CreateEnum
CREATE TYPE "AuthFlowEnum" AS ENUM ('Basic', 'GoogleOAuth', 'FacebookOAuth', 'LinkedInOAuth', 'AppleOAuth');

-- CreateEnum
CREATE TYPE "AccountTypeEnum" AS ENUM ('free', 'bronze', 'silver', 'gold', 'ultimate');

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
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ABTest_id_key" ON "ABTest"("id");
