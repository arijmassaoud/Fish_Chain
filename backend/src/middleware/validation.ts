// backend/src/middleware/validation.ts

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * A middleware factory that generates a validation middleware for a given Zod schema.
 * It validates `req.body` and passes any errors to the central error handler.
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request body against the provided schema.
      // Zod's `coerce` will handle type conversions (e.g., string to number).
      req.body = schema.parse(req.body);
      // If validation is successful, proceed to the next handler.
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // If validation fails, pass the ZodError to the central error handler.
        // The errorHandler can then format a consistent 400 response.
        return next(error); 
      }
      // For any other unexpected errors, pass them along.
      next(error);
    }
  };
};

// Import schemas from your validations file
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  categorySchema,
  productSchema,
  reservationSchema,
  updateReservationSchema,
  messageSchema,
  certificateSchema,
  updateCertificateSchema,
  idParamSchema,
} from '../validations/userValidation';

// Export a validation middleware for each schema

// Auth validations
export const registerValidation = validate(registerSchema);
export const loginValidation = validate(loginSchema);

// User validations
export const updateProfileValidation = validate(updateProfileSchema);
export const updatePasswordValidation = validate(updatePasswordSchema);

// Category validations
export const categoryValidation = validate(categorySchema);

// Product validations
export const productValidation = validate(productSchema);

// Reservation validations
export const reservationValidation = validate(reservationSchema);
export const updateReservationValidation = validate(updateReservationSchema);

// Message validations
export const messageValidation = validate(messageSchema);

// Certificate validations
export const certificateValidation = validate(certificateSchema);
export const updateCertificateValidation = validate(updateCertificateSchema);

// ID parameter validation - Note: This would typically be used on `req.params`,
// so you might need a separate validator for params if you use it.
export const idParamValidation = validate(idParamSchema);
