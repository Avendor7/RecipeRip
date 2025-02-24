// src/controllers/eventController.ts
import { Request, Response } from 'express';
import { processingEvents } from '../services/queueService.js';

export const streamEvents = (req: Request, res: Response): void => {
    // Set necessary headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let progress = 0;
    const clientId= req.query.clientId as string;

    // Listen for completion events on the queue
    processingEvents.on('completed', async ({ jobId, returnvalue }) => {

        try {
            //queue returns the jobId and a return value upon completion. Package it up and send to front end

            if(jobId === clientId + "-process-video"){
                progress = 0.5;
            }else if(jobId === clientId + "-process-text"){
                progress = 1;
            }

            //strip -process-video from the jobId so it matches
            jobId = jobId.replace(/-process-(video|text)/g, '');

            const data = {
                jobId,
                result: returnvalue,
                progress,
            };

            if(jobId === clientId){
                res.write(`data: ${JSON.stringify(data)}\n\n`);
                console.log("sending result to " + clientId + " for job " + jobId);
            }else{
                console.log("not sending result to client " + clientId + " for job " + jobId);
            }
        } catch (error) {
            const errData = {
                jobId,
                error: 'An error occurred while retrieving job data.',
            };
            if(jobId === clientId){
                res.write(`data: ${JSON.stringify(errData)}\n\n`);
                console.log("sending result to " + clientId + " for job " + jobId);
            }else{
                console.log("not sending result to client " + clientId + " for job " + jobId);
            }
        }
    });

    // Listen for completion events on the queue
    processingEvents.on('added', async ({ jobId, name }) => {

        //queue returns the jobId and a return value upon completion. Package it up and send to front end

        if(jobId === clientId + "-process-video"){
            progress = 0.2;
        }else if(jobId === clientId + "-process-text"){
            progress = 0.8;
        }

        //strip -process-video from the jobId so it matches
        jobId = jobId.replace(/-process-(video|text)/g, '');

        try {
            const data = {
                jobId,
                name,
                progress,
            };

            if(jobId === clientId){
                res.write(`data: ${JSON.stringify(data)}\n\n`);
                console.log("sending result to " + clientId + " for job " + jobId);
            }else{
                console.log("not sending result to client " + clientId + " for job " + jobId);
            }
        } catch (error) {
            const errData = {
                jobId,
                error: 'An error occurred while retrieving job data.',
            };
            if(jobId === clientId){
                res.write(`data: ${JSON.stringify(errData)}\n\n`);
                console.log("sending result to " + clientId + " for job " + jobId);
            }else{
                console.log("not sending result to client " + clientId + " for job " + jobId);
            }
        }
    });

    // When the client closes the connection, stop sending events
    req.on('close', () => {
        console.log('Client disconnected from SSE');
        processingEvents.removeAllListeners('completed');
    });
};