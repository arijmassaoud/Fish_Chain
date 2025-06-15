import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '../utils/mailer';
import axios from 'axios';



type UserRole = 'ADMIN' | 'SELLER' | 'BUYER' | 'VET';


const prisma = new PrismaClient();
// Move this to the top of your controller fileimport { Request, Response, NextFunction } from 'express';


// Helper function to get JWT secret
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const validRoles = ['ADMIN', 'SELLER', 'BUYER', 'VET'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid role provided.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Optional profilePicture URL or default avatar

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
   
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
       
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    return res.status(201).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

// Explicitly type req, res, and next directly in the function signature
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.',
        });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
   const token = jwt.sign(
  { id: user.id, role: user.role },
  getJwtSecret(), // ✅ Safely retrieve JWT secret
  { expiresIn: '1d' }
);
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

  

    // TypeScript now correctly knows res.json() exists on Response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error); // Pass error to the next middleware
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
      return 
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
       res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Delete session from DB
    await prisma.session.delete({
      where: { token },
    });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    // Ignore error if session doesn't exist
    res.status(200).json({ success: true, message: 'Logged out.' });
  }
};
// backend/src/controllers/authController.ts



// backend/src/controllers/authController.ts


// backend/src/controllers/authController.ts


// ✅ CORRECTED forgotPassword function
//
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return generic success message
    if (!user) {
      return res.json({
        success: true,
        message: 'If this email is registered, a reset link has been sent.',
      });
    }

    // Clear any existing token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    // Generate fresh token and expiry
    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetExpiry,
      },
    });

    // Send only the clean token in email
    await sendPasswordResetEmail(email, resetToken);

    console.log('✅ Reset email sent to:', email);
    return res.json({
      success: true,
      message: 'Reset link sent to your email',
    });
  } catch (error) {
    console.error('🚨 Error in forgotPassword:', error);
    return next(error);
  }
};
// ✅ CORRECTED and CLEANED resetPassword function
//
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword, token } = req.body;

    if (!newPassword || !token) {
      return res.status(400).json({
        success: false,
        message: 'Missing token or new password',
      });
    }

    console.log("Received token:", token);

    // Find user by token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gt: new Date() }, // Valid and not expired
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token. Please request a new link.',
      });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    console.log(`✅ Password updated successfully for user: ${user.email}`);
    return res.json({
      success: true,
      message: 'Password has been changed successfully!',
    });
  } catch (error) {
    console.error('🚨 Error in resetPassword:', error);
    return next(error);
  }
};
// src/controllers/authController.js

// pages/api/auth/google.ts

// Define Google User Response type
interface GoogleUserResponse {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google User ID
}
// Define a minimal safe user type to send in API responses
interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string | null;
  googleId?: string | null;
}
export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google ID token manquant.' });
  }

  try {
    // Step 1: Verify the Google ID token
    const googleRes = await axios.get<GoogleUserResponse>(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );

    const { email, name, picture, sub: googleId } = googleRes.data;

    // Step 2: Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Step 3: Create new user
      const newUser = await prisma.user.create({
        data: {
          id: googleId,
          name,
          email,
          password: "",
          profilePicture:  'https://example.com/default-avatar.png' ,

          googleId,
          role: "BUYER",
        },
      });

      const safeUser: SafeUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePicture: newUser.profilePicture || null,
        googleId: newUser.googleId || null,
      };

      const payload = {
        id: newUser.id,
        role: newUser.role,
        email: newUser.email,
      };

      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
      const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

      return res.json({
        token: jwtToken,
        user: safeUser,
      });
    }

    // Step 4: If user exists but no googleId, link account
    if (!user.googleId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    // Step 5: Generate JWT
    const payload = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
    const jwtToken = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || null,
      googleId: user.googleId || null,
    };

    return res.json({
      token: jwtToken,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion avec Google:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || 'No response',
    });

    if (error.response?.status === 400) {
      return res.status(401).json({ message: 'Token Google invalide ou expiré.' });
    }

    return res.status(500).json({ message: "Erreur interne du serveur." });
  }
};



async function cleanupExpiredTokens() {
  await prisma.user.updateMany({
    data: {
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null,
    },
    where: {
      resetPasswordTokenExpiry: {
        lt: new Date(),
      },
    },
  });
}

cleanupExpiredTokens()
  .then(() => console.log('✅ Expired tokens cleaned up'))
  .catch((err) => console.error('🚨 Failed to clean up tokens:', err))
  .finally(() => prisma.$disconnect());