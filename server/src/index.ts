import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { videoProcessQueue } from './queue.js';
import { QueueEvents } from 'bullmq';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || '3000', 10);
const PROJECT_ROOT = process.cwd();

const connection = { host: 'localhost', port: 6379 };
const videoProcessEvents = new QueueEvents('videoProcessQueue', { connection });

app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const fileName = `${file.fieldname}-${Date.now()}${ext}`;
    callback(null, fileName);
  },
});

const upload = multer({ storage });
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('File uploaded:', req.file);

    await videoProcessQueue.add('convert-and-process', {
      filePath: req.file?.path,
      projectRoot: PROJECT_ROOT
    });

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

app.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  //event for when the video processing completes
  videoProcessEvents.on('completed', async (jobId, returnValue) => {
    try {
      const data = {
        jobId,
        ollamaResult: returnValue,
      };

      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      const errData = {
        jobId,
        error: 'An error occurred while retrieving job data.',
      };
      res.write(`data: ${JSON.stringify(errData)}\n\n`);
    }
  });

  req.on('close', () => {
    console.log('Client disconnected from SSE');
  });
});

app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});