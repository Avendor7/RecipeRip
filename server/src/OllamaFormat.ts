import ollama from 'ollama';
import fs from 'fs';
import path from 'node:path'

export default async function readAndProcessFile(convertedTextFilePath: string): Promise<string> {
  try {

    const filepath = path.resolve('',convertedTextFilePath);
    console.log(filepath);
    let text = await fs.promises.readFile(filepath, 'utf8');
    let messageString = 'format the cooking recipe from the following tik tok video transcription text. ' + text;
    console.log(messageString);
    const response = await ollama.chat({
      model: 'llama3.1:8b',
      messages: [{ role: 'user', content: messageString }],
    });
    console.log(response.message.content);
    return response.message.content;
  } catch (err) {
    console.error("Error reading file or processing:", err);
    return "Error reading file or processing";
  }

}
