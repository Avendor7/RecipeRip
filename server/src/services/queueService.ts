// src/services/queueService.ts
import { Queue, QueueEvents, Worker } from 'bullmq';
import { REDIS_CONNECTION, PROJECT_ROOT } from '../config/index.js';
import { processVideo } from './videoProcessor.js';

export const videoProcessQueue = new Queue('videoProcessQueue', { connection: REDIS_CONNECTION });
export const videoProcessEvents = new QueueEvents('videoProcessQueue', { connection: REDIS_CONNECTION });

// Function to add a job to the queue
export const addVideoProcessingJob = async (filePath: string) => {
  await videoProcessQueue.add('convert-and-process', {
    filePath,
    projectRoot: PROJECT_ROOT,
  });
};

// Initialize the worker
export const initializeWorker = () => {
  const worker = new Worker('videoProcessQueue', async (job) => {
    console.log(`Processing job with ID: ${job.id}`);

    const { filePath, projectRoot } = job.data;

    try {
      const result = await processVideo(filePath, projectRoot);
      console.log(`Job ${job.id} completed successfully.`);
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error; // Indicates job failure
    }
  }, { connection: REDIS_CONNECTION });

  // Optional: Listen to worker events
  worker.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
  });

  worker.on('failed', (job, err) => {
    //console.error(`Job ${job.id} failed with error:`, err);
  });

  return worker;
};