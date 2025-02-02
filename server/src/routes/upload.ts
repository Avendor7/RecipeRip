// src/routes/upload.ts
import { Router } from 'express';
import { upload } from '../utils/storage.js';
import { uploadVideo } from '../controllers/uploadController.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadVideo);

export default router;
