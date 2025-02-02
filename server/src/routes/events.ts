// src/routes/events.ts
import { Router } from 'express';
import { streamEvents } from '../controllers/eventController.js';

const router = Router();

router.get('/events', streamEvents);

export default router;
