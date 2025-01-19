// Import required modules
import express, { Request, Response } from 'express'; // Import Request and Response types
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Enable parsing JSON requests

// Define a port from .env or use a default value
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Define a simple route
app.get('/', (req: Request, res: Response): void => {
  res.send('Hello World!');
});

// Start the server
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});