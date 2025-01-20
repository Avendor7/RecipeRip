import path from 'node:path'
import {nodewhisper} from "nodejs-whisper";

// // Copied from https://www.wavsource.com/people/famous.htm
// const AUDIO_FILE = 'input_video.mp4'
//
// // Need to provide exact path to your audio file.
// const filePath = path.resolve('', AUDIO_FILE)
// console.log(filePath);
export default async function convert(filePath: string | undefined) {
  try {
    if (!filePath) {return ""}
    console.log(filePath);
    return await nodewhisper(filePath, {
      modelName: 'tiny.en',
      autoDownloadModelName: 'tiny.en',
      whisperOptions: {
        outputInVtt: false,
        outputInText: true,
        splitOnWord: false,
        // Default is 20 which is too long
      },
    })
  } catch (exc) {
    console.error(exc)
    process.exit(1)
  }
}