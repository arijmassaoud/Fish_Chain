// backend/src/routes/search.ts
import { Router } from 'express';
import { searchEverything } from '../controllers/searchController';

const router = Router();

router.post('/', searchEverything);

export default router;