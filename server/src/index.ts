// Import required modules
import express, { Request, Response } from 'express'; // Import Request and Response types
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import readAndProcessFile from './OllamaFormat.js';
import convert from './SpeechToText.js';
import fs from 'fs';

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

// Configure storage to include the original file extension
const storage = multer.diskStorage({
  destination: 'uploads/', // Directory to save files
  filename: (req, file, cb) => {
    // Extract the original file extension
    const ext = path.extname(file.originalname);
    // Construct the new filename
    const fileName = `${file.fieldname}-${Date.now()}${ext}`;
    // Save the file with the new name
    cb(null, fileName);
  },
});

// Create the multer upload object with the custom storage configuration
const upload = multer({ storage });
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('File uploaded:', req.file);

    const convertedTextFilePath = convert(req.file?.path);

    convertedTextFilePath.then((text: string) => {

      const ollamaFormattedText = readAndProcessFile(text);

      ollamaFormattedText.then((result: string) => {

        // Send success response
        res.status(200).json({
          message: 'File uploaded successfully',
          file: req.file?.path, // File info (includes path, original name, size, etc.)
          data: result,
        });

      });
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



function fileExists(filePath:any, callback:any) {
  fs.access(filePath, (err) => {
    callback(!err); // If no error, file exists
  });
}



