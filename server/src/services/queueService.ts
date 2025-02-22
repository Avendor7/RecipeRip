import { Queue, QueueEvents, Worker, Job } from 'bullmq';
import { REDIS_CONNECTION, PROJECT_ROOT } from '../config/index.js';
import { processVideo, processText } from './fileProcessor.js';

// Define types for job data
type VideoJobData = {
  filePath: string;
  projectRoot: string;
};

type TextJobData = {
  text: string;
};

export const processingQueue = new Queue('processingQueue', { connection: REDIS_CONNECTION });
export const processingEvents = new QueueEvents('processingQueue', { connection: REDIS_CONNECTION });

export const addVideoProcessingJob = async (filePath: string, clientId: string) => {
  await processingQueue.add('process-video', {
    filePath,
    projectRoot: PROJECT_ROOT,
  } as VideoJobData, {
    jobId: clientId + "-process-video"

  });
};

export const addTextProcessingJob = async (text: string, clientId: string) => {
  clientId = clientId.replace(/-process-video/g, '');
  await processingQueue.add('process-text', {
    text,
  } as TextJobData,{
    jobId: clientId + "-process-text"
  });
};

export const initializeWorker = () => {
  const worker = new Worker('processingQueue', async (job) => {
    console.log(`Processing job ${job.name} with ID: ${job.id}`);

    try {
      let result;

      if (job.name === 'process-video') {

        const { filePath, projectRoot } = job.data as VideoJobData;

        result = await processVideo(filePath, projectRoot);

        // Automatically queue the ollama text processing job with the resulting text
        await addTextProcessingJob(result, job.id || "");

      } else if (job.name === 'process-text') {
        const { text } = job.data as TextJobData;
        result = await processText(text);
      }

      console.log(`Job ${job.id} completed successfully.`);

      return result;

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  }, { connection: REDIS_CONNECTION });

  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    if (job) {
      console.error(`Job ${job.id} failed with error:`, err);
    } else {
      console.error('Job failed with error (no job details available):', err);
    }
  });

  return worker;
};