import path from 'node:path'
import {nodewhisper} from "nodejs-whisper";
import fs from 'fs';
// // Copied from https://www.wavsource.com/people/famous.htm
// const AUDIO_FILE = 'input_video.mp4'
//
// // Need to provide exact path to your audio file.
// console.log(filePath);
export default async function convert(filePath: string | undefined): Promise<string> {
  try {
    if (!filePath) {return ""}
    //console.log(filePath);
    const file = path.resolve('', filePath)
    await nodewhisper(file, {
      modelName: 'tiny.en',
      autoDownloadModelName: 'tiny.en',
      whisperOptions: {
        outputInVtt: false,
        outputInText: true,
        splitOnWord: false,
        // Default is 20 which is too long
      },
    })

    console.log(file);
    return "/uploads/" + path.basename(file, ".mp4") + ".wav.txt";
  } catch (exc) {
    console.error(exc)
    process.exit(1)
  }
}