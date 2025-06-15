import { Router } from 'express';
import { getAllProductsForVet, reviewProduct } from '../controllers/veterinarianController';

const router = Router();

router.get('/products', getAllProductsForVet); // GET /api/vet/products?status=pending
router.patch('/review/:productId', reviewProduct); // PATCH /api/vet/review/:productId

export default router;