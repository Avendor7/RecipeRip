// src/routes/app.ts
import { Router } from 'express';
import uploadRoute from './upload.js';
import eventsRoute from './events.js';

const router = Router();

router.use('/', uploadRoute);
router.use('/', eventsRoute);

export default router;
