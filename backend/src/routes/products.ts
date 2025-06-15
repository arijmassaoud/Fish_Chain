// backend/src/routes/products.ts

import express from 'express';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { productValidation } from '../middleware/validation';
import multer from 'multer';

// Correctly import the getRecommendations function from its dedicated controller file.
import { getRecommendations } from './recommendation.route';

const upload = multer();
const router = express.Router();

// --- Public Routes ---
router.get('/', getProducts);

// --- Recommendation Route ---
// This route for recommendations must come before the general '/:id' route.
router.get('/:id/recommendations', getRecommendations);

// --- Single Product Route ---
router.get('/:id', getProduct);

// --- Protected Routes (for Sellers and Admins) ---
router.post('/', authenticate, authorize(['SELLER', 'ADMIN']), upload.single('image'), productValidation, createProduct);
router.put('/:id', authenticate, authorize(['SELLER', 'ADMIN']), upload.single('image'), productValidation, updateProduct);
router.delete('/:id', authenticate, authorize(['SELLER', 'ADMIN']), deleteProduct);

export default router;
