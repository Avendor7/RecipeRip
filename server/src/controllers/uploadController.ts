// src/controllers/uploadController.ts
import { Request, Response } from 'express';
import { addVideoProcessingJob } from '../services/queueService.js';

export const uploadVideo = async (req: Request, res: Response) :Promise<void> => {
    try {
        console.log('File uploaded:', req.file);
        console.log('ClientID:', req.body.clientId);
        await addVideoProcessingJob(req.file?.path || '', req.body.clientId);

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