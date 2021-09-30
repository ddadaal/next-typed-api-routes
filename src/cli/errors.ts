import fs from "fs";
import path from "path";

export async function checkApiRoutesPath(dirPath: string) {
  if (!await fs.promises.access(dirPath).then(() => true).catch(() => false)) {
    throw new Error(`Api Routes ${dirPath} cannot be accessed. Does it exist?`);
  }
}

export async function createDir(filePath: string) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
}
