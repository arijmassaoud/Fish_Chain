// backend/src/routes/reservations.ts

import { Router } from 'express';
import { 
    createReservation, 
    getReservations, 
    updateReservationStatus 
} from '../controllers/reservationController';
import { authenticate, authorize } from '../middleware/auth';
import { reservationValidation, updateReservationValidation } from '../middleware/validation';

const router = Router();

// All reservation routes require authentication
router.use(authenticate);

// POST /api/reservations - Create a new reservation (for buyers)
router.post('/', authorize(['BUYER']), reservationValidation, createReservation);

// GET /api/reservations - Get reservations (dynamic based on user role)
router.get('/', getReservations);

// PATCH /api/reservations/:id/status - Update reservation status (for sellers/admins)
router.patch(
    '/:id/status', 
    authorize(['SELLER', 'ADMIN']), 
    updateReservationValidation, 
    updateReservationStatus
);

export default router;
