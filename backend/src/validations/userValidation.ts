import { z } from 'zod';

// User validations
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'SELLER', 'BUYER', 'VET']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
// Category validations
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Image URL must be valid').optional(),
  isPublic: z.boolean().optional(),
});

// Product validations
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().min(0, 'Price must be a positive number'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a positive integer'),
  categoryId: z.string().min(1, 'Category is required'),
  isPublic: z.boolean().optional(),
});

// Reservation validations
export const reservationSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateReservationSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

// Message validations
export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver is required'),
  content: z.string().min(1, 'Message content is required'),
});

// Certificate validations
export const certificateSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  type: z.string().min(1, 'Certificate type is required'),
  description: z.string().min(1, 'Description is required'),
  validUntil: z.string().datetime('Valid expiration date is required'),
});

export const updateCertificateSchema = z.object({
  type: z.string().min(1, 'Type cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
  validUntil: z.string().datetime('Valid expiration date is required').optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'REVOKED']).optional(),
});

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
}); 