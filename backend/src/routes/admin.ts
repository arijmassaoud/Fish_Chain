// backend/src/routes/admin.ts

import { Router } from 'express';
import {
    getAdminStats,
    getUsers,
    updateUserRole,
    getDashboardStats, 
    getSystemActivity,
 
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and ADMIN role.
router.use(authenticate, authorize(['ADMIN']));

// GET /api/admin/stats - Get dashboard stats
router.get('/stats', getAdminStats);

// GET /api/admin/users - Get a list of all users
router.get('/users', getUsers);

// GET /api/admin/activity - Get recent system activity
router.get('/activity', getSystemActivity);

// PATCH /api/admin/users/:id/role - Update a user's role
router.patch('/users/:id/role', updateUserRole);

// PATCH /api/admin/users/:id/activation - Deactivate or reactivate a user

router.get('/dashboard/stats',getDashboardStats);
router.get('/admin/activity',  getSystemActivity);

export default router;
