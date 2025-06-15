import { Router } from 'express';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all certificates
router.get('/', getAllCertificates);

// Get certificate by ID
router.get('/:id', getCertificateById);

// Create new certificate (veterinarian only)
router.post('/', authorize(['VET', 'ADMIN']), createCertificate);

// Update certificate (veterinarian or admin only)
router.put('/:id', authorize(['VET', 'ADMIN']), updateCertificate);

// Delete certificate (admin only)
router.delete('/:id', authorize(['ADMIN']), deleteCertificate);

export default router; 