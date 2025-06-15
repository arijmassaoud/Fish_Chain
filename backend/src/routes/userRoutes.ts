import express from 'express';
import { updateProfile, updatePassword } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { updateProfileSchema, updatePasswordSchema } from '../validations/userValidation';

const router = express.Router();

// Protected routes - require authentication only
router.put('/auth/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/auth/password', authenticate, validate(updatePasswordSchema), updatePassword);

export default router; 