const crypto = require("crypto");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("md5").update(content).digest("hex");
  } catch (error) {
    return null;
  }
}

function saveHash(hash) {
  fs.writeFileSync(".prisma-hash", hash);
}

function getPreviousHash() {
  try {
    return fs.readFileSync(".prisma-hash", "utf-8");
  } catch (error) {
    return null;
  }
}

function main() {
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const currentHash = getFileHash(schemaPath);
  const previousHash = getPreviousHash();

  if (currentHash !== previousHash) {
    console.log("🔄 Prisma schema changes detected, running generate and migrate...");
    try {
      execSync("yarn db:prisma:generate", { stdio: "inherit" });
      execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
      saveHash(currentHash);
    } catch (error) {
      console.error("Failed to run Prisma commands:", error.message);
      process.exit(1);
    }
  } else {
    console.log("✅ No Prisma schema changes detected, skipping generate and migrate.");
  }
}

main();
