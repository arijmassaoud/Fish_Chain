import { Request, Response, NextFunction } from 'express';

type User = {
  id: string;
  role: 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';
};

export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Specific role middleware functions
export const isAdmin = checkRole(['ADMIN']);
export const isSeller = checkRole(['SELLER', 'ADMIN']);
export const isBuyer = checkRole(['BUYER', 'ADMIN']);
export const isVet = checkRole(['VET', 'ADMIN']); 