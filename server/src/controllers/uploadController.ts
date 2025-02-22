// src/controllers/uploadController.ts
import { Request, Response } from 'express';
import { addVideoProcessingJob } from '../services/queueService.js';

interface UploadRequest extends Request{
    body: {
        clientId: string;
    }
}

export const uploadVideo = async (req: UploadRequest, res: Response) :Promise<void> => {
    try {
        console.log('File uploaded:', req.file);
        console.log('Client ID:', req.body.clientId);
        await addVideoProcessingJob(req.file?.path || '', req.body.clientId || "");

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
};