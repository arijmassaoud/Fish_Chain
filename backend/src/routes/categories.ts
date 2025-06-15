// backend/src/routes/categories.ts

import { Router } from 'express';
import {
    createCategory,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { categorySchema } from '../validations/userValidation';
import multer from 'multer';

const upload = multer();
const router = Router();

// Public routes to get category data
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes for admins to manage categories
router.post(
    '/',
    authenticate,
    authorize(['ADMIN']),
    upload.single('image'),
    validate(categorySchema),
    createCategory
);

router.put(
    '/:id',
    authenticate,
    authorize(['ADMIN']),
    upload.single('image'),
    validate(categorySchema.partial()),
    updateCategory
);

router.delete('/:id', authenticate, authorize(['ADMIN']), deleteCategory);

export default router;
