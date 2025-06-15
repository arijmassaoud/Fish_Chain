import { Router } from 'express';
import { googleLogin } from '../controllers/authController';

const router = Router();

// Define your route
router.post('/google', googleLogin);

export default router;