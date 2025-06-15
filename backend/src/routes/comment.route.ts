import { Router } from 'express';
import { getCommentsForProduct, createComment, toggleReaction, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:productId', getCommentsForProduct); // Publicly view comments
router.post('/', authenticate, createComment); // Must be logged in to comment
router.post('/:commentId/react', authenticate, toggleReaction); // Must be logged in to react
router.delete('/:commentId', authenticate, deleteComment); // Must be logged in to delete

export default router;