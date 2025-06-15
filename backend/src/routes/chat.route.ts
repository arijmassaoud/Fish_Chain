// backend/src/routes/chat.route.ts

import { Router } from 'express';
// We will move the logic to a controller file
import { handleChat } from '../controllers/chatController';

const router = Router();

// The route now uses authentication and calls the dedicated controller
router.post('/chat', handleChat);

export default router;
