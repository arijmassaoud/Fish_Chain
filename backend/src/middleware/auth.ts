// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add this type definition at the top of your middleware file
// This tells TypeScript what `req.user` will look like.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

// ✅ FIX: This is the standard, correct way to authenticate with JWTs.
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Check for the "Authorization: Bearer <token>" header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token is valid. This will throw an error if it's not.
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // 3. Check if the user ID exists in the decoded token
      if (!decoded.id) {
           res.status(401).json({ success: false, message: 'Not authorized, token is missing user ID' });
           return
      }

      // 4. Use the ID from inside the token to find the user in the database.
      // We are NO LONGER checking a session table.
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }, // Select safe fields
      });

      // If the user belonging to this token has been deleted
      if (!user) {
         res.status(401).json({ success: false, message: 'Not authorized, user not found' });
         return
      }

      // 5. Attach the found user object to the request for the next functions to use
      req.user = user;

      next(); // Success! Proceed to the next step (e.g., the authorize middleware or the controller).
    } catch (error) {
      console.error('Authentication error:', error);
       res.status(401).json({ success: false, message: 'Not authorized, token failed verification' });
       return
    }
  }

  if (!token) {
     res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
     return
  }
};


// This function is correct, but it depends on `authenticate` working properly.
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('DEBUG: Checking authorization for user:', req.user);
    
    if (!req.user || !req.user.role) {
       res.status(401).json({ success: false, message: 'Authentication required. User role not found.' });
       return
    }

    if (!roles.includes(req.user.role)) {
       res.status(403).json({ success: false, message: 'Authorization denied. Insufficient permissions.' });
       return
    }

    next();
  };
};