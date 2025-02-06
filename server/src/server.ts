import app from './app.js';
import { PORT, REDIS_CONNECTION } from './config/index.js';
import { initializeWorker, processingQueue, processingEvents } from './services/queueService.js';


// Initialize the worker
const worker = initializeWorker();

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
const shutdown = async () => {
    console.log('Shutting down server...');
    server.close(async () => {
        try {
            // Close the queue and workers
            await processingQueue.close();
            await processingEvents.close();
            await worker.close();
            console.log('Shutdown complete.');
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);