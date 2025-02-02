import path from 'node:path'
import {nodewhisper} from "nodejs-whisper";

export default async function convert(filePath: string | undefined, projectRoot: string): Promise<string> {
  try {

    if (!filePath) {return ""} //TODO: better error handling here

    const file = path.resolve('', filePath)

    await nodewhisper(file, {
      modelName: 'tiny.en',
      autoDownloadModelName: 'tiny.en',
      whisperOptions: {
        outputInVtt: false,
        outputInText: true,
        splitOnWord: false,
      },
    })

    // Reset CWD back to project root
    process.chdir(projectRoot);

    return replaceFileExtension(filePath, ".wav.txt");
  } catch (exc) {
    console.error(exc)
    process.exit(1)
  }
}

function replaceFileExtension(filePath: string, newExt: string): string {
  const parsedPath = path.parse(filePath);
  parsedPath.ext = newExt; // Set new extension
  parsedPath.base = parsedPath.name + newExt; // Update base
  return path.format(parsedPath); // Reconstruct path
}
