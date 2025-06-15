// backend/src/routes/users.ts

import { Router } from 'express';
import { 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser 
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// These routes are for administrative purposes and should be protected.

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get a single user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update a user's details
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete a user
router.delete('/:id', deleteUser);

export default router;
