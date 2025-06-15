// backend/src/types/express.d.ts
import { Server as SocketIOServer } from 'socket.io';
// This file extends the default Express Request type to avoid TypeScript errors.

// Define the valid user roles for your application
export type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';

// Define the shape of the user object that will be attached to the request
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
// Use declaration merging to add custom properties to the Express Request object

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';

      };
      io?: SocketIOServer;
    }
  }
}
