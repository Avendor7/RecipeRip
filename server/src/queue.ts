import { Queue, Worker } from 'bullmq';
import convert from './SpeechToText.js';
import readAndProcessFile from './OllamaFormat.js';
// Redis connection options (update based on your system)
const connection = {
  host: 'localhost',
  port: 6379,
};

// Rename the queue to reflect broader functionality
export const videoProcessQueue = new Queue('videoProcessQueue', { connection });

// Worker to process jobs
const videoProcessWorker = new Worker('videoProcessQueue', async (job) => {
  console.log(`Processing job with ID: ${job.id}`);

  // Get job data
  const { filePath, projectRoot } = job.data;

  try {
    // Call the functions for video processing (speech-to-text and formatting)
    const convertedTextFilePath = await convert(filePath, projectRoot); // Assuming you'll rename this later
    const formattedText = await readAndProcessFile(convertedTextFilePath); // Assuming you'll rename this too

    console.log(`Job completed successfully - Result: ${formattedText}`);
    return formattedText;
  } catch (err) {
    console.error('Error processing job:', err);
    throw err; // Fail the job if there's an error
  }
}, { connection });