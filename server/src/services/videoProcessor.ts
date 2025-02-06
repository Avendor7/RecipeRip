// src/services/videoProcessor.ts
import { convertSpeechToText } from './speechToText.js';
import { processWithOllama } from './ollamaFormat.js';

export const processVideo = async (filePath: string, projectRoot: string): Promise<string> => {
    try {
        return await convertSpeechToText(filePath, projectRoot);;
    } catch (error) {
        console.error("Error in processVideo:", error);
        throw error; // Ensure errors are handled by the worker
    }
};

export const processText = async (inputText: string): Promise<string> => {
    try {
        return await processWithOllama(inputText);
    } catch (error) {
        console.error("Error in processText:", error);
        throw error; // Ensure errors are handled by the worker
    }
};