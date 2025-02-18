// src/controllers/eventController.ts
import { Request, Response } from 'express';
import { processingEvents } from '../services/queueService.js';

// Store active client connections
const clients = new Map<string, Response>();


export const streamEvents = (req: Request, res: Response): void => {
    // Set necessary headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let textProcessJobID = "";
    let videoProcessJobID = "";
    let progress = 0;

    // Get client ID from query parameters
    const clientId = req.query.clientId as string;
    if (!clientId) {
        res.status(400).json({ error: 'Client ID is required' });
        return;
    }

    // Store the client connection
    clients.set(clientId, res);
    console.log("Client " + clientId + " connected to SSE");

    // Listen for completion events on the queue
    processingEvents.on('completed', async ({ jobId, returnvalue }) => {

        try {
            //queue returns the jobId and a return value upon completion. Package it up and send to front end

            if(!textProcessJobID){
                textProcessJobID = jobId;
                progress = 0.5;
            }else{
                videoProcessJobID = jobId;
                progress = 1;
            }

            const data = {
                jobId,
                result: returnvalue,
                progress,
            };

            // Only send to the specific client
            const clientRes = clients.get(clientId);
            if (clientRes) {
                console.log("client data sent for " + clientId);
                clientRes.write(`data: ${JSON.stringify(data)}\n\n`);
            }

        } catch (error) {
            const errData = {
                jobId,
                error: 'An error occurred while retrieving job data.',
            };
            res.write(`data: ${JSON.stringify(errData)}\n\n`);
        }
    });

    // Listen for completion events on the queue
    processingEvents.on('added', async ({ jobId, name }) => {
        if(name === 'process-video'){
            progress = 0.1;
        }
        try {
            const data = {
                jobId,
                name,
                progress,
            };
            // Only send to the specific client
            const clientRes = clients.get(clientId);
            if (clientRes) {
                clientRes.write(`data: ${JSON.stringify(data)}\n\n`);
            }
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
        console.log(`Client ${clientId} disconnected from SSE`);
        clients.delete(clientId);
    });

};