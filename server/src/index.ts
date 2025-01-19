// Import required modules
import express, { Request, Response } from 'express'; // Import Request and Response types
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import readAndProcessFile from './OllamaFormat';
import convert from './SpeechToText';

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


// Configure Multer storage
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the "uploads" folder

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    // Log file information (e.g., original name, path)
    console.log('File uploaded:', req.file);

    // Send success response
    res.status(200).json({
      message: 'File uploaded successfully',
      file: req.file, // File info (includes path, original name, size, etc.)
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Start the server
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});