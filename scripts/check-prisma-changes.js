const crypto = require("crypto");
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Function to compute the hash of a file using SHA-256
function getFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  } catch (error) {
    return null;
  }
}

// Function to save the current hash to a file
function saveHash(hash) {
  fs.writeFileSync(".prisma-hash", hash);
}

// Function to retrieve the previously saved hash
function getPreviousHash() {
  try {
    return fs.readFileSync(".prisma-hash", "utf-8");
  } catch (error) {
    return null;
  }
}

// Function to check if the Prisma Client has been generated
function isPrismaClientGenerated() {
  const clientPath = path.join(process.cwd(), "node_modules", ".prisma", "client");
  const indexPath = path.join(clientPath, "index.js");

  // Check for essential Prisma client files
  const requiredFiles = [indexPath, path.join(clientPath, "schema.prisma"), path.join(clientPath, "index-browser.js")];

  return requiredFiles.every((file) => fs.existsSync(file));
}

function main() {
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const currentHash = getFileHash(schemaPath);
  const previousHash = getPreviousHash();
  const clientGenerated = isPrismaClientGenerated();

  if (currentHash === null) {
    console.error("❌ Unable to read Prisma schema file.");
    process.exit(1);
  }

  const needsRegeneration = currentHash !== previousHash || !clientGenerated;

  if (needsRegeneration) {
    console.log("🔄 Generating Prisma Client...");

    try {
      // Generate Prisma Client
      execSync("npx prisma generate", { stdio: "inherit" });

      // Run migrations
      execSync("npx prisma migrate dev --name init", { stdio: "inherit" });

      // Save the new hash after successful generation
      saveHash(currentHash);

      console.log("✅ Prisma Client generated successfully.");
    } catch (error) {
      console.error("❌ Failed to generate Prisma Client:", error.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Prisma Client is up-to-date.");
  }
}

main();
