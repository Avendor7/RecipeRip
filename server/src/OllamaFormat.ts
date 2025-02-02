import ollama from 'ollama';
import fs from 'fs';
import path from 'node:path'

export default async function readAndProcessFile(convertedTextFilePath: string): Promise<string> {
  try {
    const filepath = path.resolve('',convertedTextFilePath);

    let text = await fs.promises.readFile(filepath, 'utf8');

    let messageString = 'The following text is a transcription from a Tik Tok video that shows how to cook something. ' +
      'Take this text and format it like it would appear in a cookbook or website. The output should be Markdown formatted' + text;

    const response = await ollama.chat({
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: messageString }],
    });

    return response.message.content;

  } catch (err) {
    console.error("Error reading file or processing:", err);
    return "Error reading file or processing";
  }

}
