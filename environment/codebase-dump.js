const path = require("path");
const fs = require("fs-extra");
const glob = require("glob");
const archiver = require("archiver");

const ROOT_PATH = path.resolve(__dirname, ".."); // Adjust based on your project structure
const SRC_PATH = path.join(ROOT_PATH, "src");
const DUMP_PATH = path.join(ROOT_PATH, "code-dump");
const ZIP_PATH = path.join(ROOT_PATH, "code-dump.zip");

async function dumpCodebase() {
  try {
    // Ensure code-dump directory exists
    await fs.ensureDir(DUMP_PATH);

    // Find all .ts files in the src directory
    const tsFiles = glob.sync(path.join(SRC_PATH, "providers/**/*.ts"), {
      ignore: ["**/*.d.ts", "**/*blueprints*/*", "**/*recipes*/*"],
    });

    // Copy each .ts file to the code-dump directory
    await Promise.all(
      tsFiles.map(async (file) => {
        const fileContent = await fs.readFile(file, "utf-8");
        if (fileContent.includes(" class ")) {
          const dest = path.join(DUMP_PATH, path.relative(SRC_PATH, file));
          await fs.copy(file, dest);
        }
      })
    );

    // Create a zip file of the code-dump directory
    const output = fs.createWriteStream(ZIP_PATH);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    output.on("close", async () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log("Archiver has been finalized and the zip file is written.");

      // Clean up by deleting the original code-dump folder
      await fs.remove(DUMP_PATH);
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(DUMP_PATH, false);
    await archive.finalize();
  } catch (error) {
    console.error("Error during codebase dump:", error);
  }
}

dumpCodebase();
