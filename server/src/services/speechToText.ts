// src/services/speechToText.ts
import path from 'node:path';
import { nodewhisper } from 'nodejs-whisper';

export const convertSpeechToText = async (filePath: string | undefined, projectRoot: string): Promise<string> => {
    try {
        if (!filePath) {
            throw new Error("File path is undefined");
        }

        const file = path.resolve('', filePath);

        await nodewhisper(file, {
            modelName: 'tiny.en',
            autoDownloadModelName: 'tiny.en',
            whisperOptions: {
                outputInVtt: false,
                outputInText: true,
                splitOnWord: false,
            },
        });

        // Reset CWD back to project root
        process.chdir(projectRoot);

        return replaceFileExtension(filePath, ".wav.txt");
    } catch (error) {
        console.error("Error in convertSpeechToText:", error);
        throw error; // Propagate error for higher-level handling
    }
};

const replaceFileExtension = (filePath: string, newExt: string): string => {
    const parsedPath = path.parse(filePath);
    parsedPath.ext = newExt; // Set new extension
    parsedPath.base = parsedPath.name + newExt; // Update base
    return path.format(parsedPath); // Reconstruct path
};