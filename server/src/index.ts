// Import required modules
import express, { Request, Response } from 'express'; // Import Request and Response types
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { videoProcessQueue } from './queue.js';
import { QueueEvents } from 'bullmq';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const PROJECT_ROOT = process.cwd();

// Create a QueueEvents instance so we can listen to queue events
const connection = { host: 'localhost', port: 6379 };
const videoProcessEvents = new QueueEvents('videoProcessQueue', { connection });


app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

// Configure storage to include the original file extension
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, callback) => {
    // Extract the original file extension
    const ext = path.extname(file.originalname);
    // Construct the new filename
    const fileName = `${file.fieldname}-${Date.now()}${ext}`;
    // Save the file with the new name
    callback(null, fileName);
  },
});

// Create the multer upload object with the custom storage configuration
const upload = multer({ storage });
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('File uploaded:', req.file);

    // Add a job to the queue (videoProcessQueue)
    await videoProcessQueue.add('convert-and-process', {
      filePath: req.file?.path,  // Path of the uploaded file
      projectRoot: PROJECT_ROOT // Project directory
    });

    // Respond to the client with success message
    res.status(200).json({
      message: 'Job added to the Video Processing Queue successfully',
      file: req.file?.path,
    });
  } catch (error) {
    console.error('Error adding job to queue:', error);

    res.status(500).json({
      error: 'An error occurred while adding the job to the queue'
    });
  }
});

// SSE endpoint
app.get('/events', (req: Request, res: Response) => {
  // Set necessary headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // You might also want to send a comment to keep the connection alive
  res.write(':\n\n');

  // When a job completes on the queue, send an SSE message
  videoProcessEvents.on('completed', (jobId, returnValue) => {
    // You can structure these messages as desired
    const data = JSON.stringify({ jobId, result: returnValue });
    // The SSE format requires "data:" prefix and a double newline
    res.write(`data: ${data}\n\n`);
  });

  // If connection is closed by the client, stop sending events
  req.on('close', () => {
    console.log('Client disconnected from SSE');
  });
});


app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});



