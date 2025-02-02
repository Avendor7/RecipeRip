import { Queue, Worker } from 'bullmq';
import convert from './SpeechToText.js';
import readAndProcessFile from './OllamaFormat.js';

const connection = {
  host: 'localhost',
  port: 6379,
};

export const videoProcessQueue = new Queue('videoProcessQueue', { connection });

const videoProcessWorker = new Worker('videoProcessQueue', async (job) => {
  console.log(`Processing job with ID: ${job.id}`);

  const { filePath, projectRoot } = job.data;

  try {
    const convertedTextFilePath = await convert(filePath, projectRoot);
    const formattedText = await readAndProcessFile(convertedTextFilePath);

    console.log(`Job completed successfully - Result: ${formattedText}`);

    return formattedText;
  } catch (err) {
    console.error('Error processing job:', err);
    throw err;
  }
}, { connection });