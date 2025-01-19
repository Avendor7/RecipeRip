import ollama from 'ollama';
import fs from 'fs';

export default async function readAndProcessFile() {
  try {
    let text = await fs.promises.readFile('output.wav.txt', 'utf8');
    let messageString = 'format the cooking recipe from the following tik tok video transcription text. ' + text;

    const response = await ollama.chat({
      model: 'llama3.1:8b',
      messages: [{ role: 'user', content: messageString }],
    });
    console.log(response.message.content);
  } catch (err) {
    console.error("Error reading file or processing:", err);
  }
}
