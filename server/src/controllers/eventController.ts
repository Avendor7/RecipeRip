// src/controllers/eventController.ts
import { Request, Response } from 'express';
import { processingEvents } from '../services/queueService.js';

export const streamEvents = (req: Request, res: Response): void => {
    // Set necessary headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Listen for completion events on the queue
    processingEvents.on('completed', async ({ jobId, returnvalue }) => {
        try {
            const data = {
                jobId,
                ollamaResult: returnvalue,
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

    // When the client closes the connection, stop sending events
    req.on('close', () => {
        console.log('Client disconnected from SSE');
        processingEvents.removeAllListeners('completed');
    });
};