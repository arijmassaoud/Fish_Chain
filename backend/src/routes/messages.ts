// backend/src/routes/messages.ts

import { Router } from 'express';
import { 
    getConversation,
    getConversations,
    markConversationAsRead
    
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Get a list of all conversations
router.get('/conversations', getConversations);

// Get the full message history with a specific user
router.get('/conversations/:otherUserId', getConversation);

// Mark a conversation as read
router.patch('/conversations/:otherUserId/read', markConversationAsRead);

export default router;
