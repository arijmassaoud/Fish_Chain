import { Router } from 'express';
import { getDashboardStats, getSalesStats } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', authenticate, authorize(['ADMIN']), getDashboardStats);

/**
 * @swagger
 * /api/dashboard/sales:
 *   get:
 *     summary: Get sales statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/sales', authenticate, authorize(['ADMIN']), getSalesStats);

export default router; 