// src/services/videoProcessor.ts
import { convertSpeechToText } from './speechToText.js';
import { processWithOllama } from './ollamaFormat.js';

export const processVideo = async (filePath: string, projectRoot: string): Promise<string> => {
    try {
        const convertedTextFilePath = await convertSpeechToText(filePath, projectRoot);
        const formattedText = await processWithOllama(convertedTextFilePath);
        return formattedText;
    } catch (error) {
        console.error("Error in processVideo:", error);
        throw error; // Ensure errors are handled by the worker
    }
};