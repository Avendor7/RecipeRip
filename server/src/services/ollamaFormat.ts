// src/services/ollamaFormat.ts
import fs from 'fs';
import path from 'node:path';
import ollama from 'ollama';

export const processWithOllama = async (convertedTextFilePath: string): Promise<string> => {
    try {
        const filepath = path.resolve('', convertedTextFilePath);
        let text = await fs.promises.readFile(filepath, 'utf8');

        const messageString = `The following text is a transcription from a TikTok video that shows how to cook something. 
Take this text and format it like it would appear in a cookbook or website. The output should be Markdown formatted:

${text}`;

        const response = await ollama.chat({
            model: 'llama3.2:1b',
            messages: [{ role: 'user', content: messageString }],
        });

        return response.message.content;
    } catch (error) {
        console.error("Error in processWithOllama:", error);
        throw error; // Propagate error for higher-level handling
    }
};