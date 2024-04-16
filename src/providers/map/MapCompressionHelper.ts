import { compress } from "compress-json";
import fs from "fs";
import JSZip from "jszip";

export const createZipMap = async (mapName: string, mapObject: object, pathToSave: string): Promise<void> => {
  const filePath = `${pathToSave}/${mapName}.zip`;

  // Delete the file if it exists
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }

  const data = compress(mapObject);
  const zip = new JSZip();
  zip.file(`${mapName}.txt`, JSON.stringify(data), {
    unixPermissions: "755",
  });
  const buffer = await zip.generateAsync({ type: "uint8array" });
  await fs.promises.writeFile(filePath, buffer);
};
