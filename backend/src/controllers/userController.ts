// backend/src/controllers/userController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ===============================================
// == Functions for a User Managing Their Own Account ==
// ===============================================

/**
 * Updates the profile information (name, email) for the currently authenticated user.
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { name, email } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: "Authentication required." });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        res.json({ success: true, message: "Profile updated successfully.", data: updatedUser });
    } catch (error) {
        next(error);
    }
};

/**
 * Updates the password for the authenticated user after verifying their current password.
 */
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: "Authentication required." });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Incorrect current password." });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        next(error);
    }
};


// ===============================================
// == Functions for an Admin Managing All Users ==
// ===============================================

/**
 * [Admin] Gets a list of all users in the system.
 */
// backend/src/controllers/userController.ts


/**
 * GET /api/users
 * Returns list of all users (used for chat)
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // ✅ Wrap in `data` field for consistency
     res.json({ success: true, data: users });
     return;
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/:id
 * Returns single user by ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
       res.status(404).json({ success: false, message: 'User not found' });
       return
    }

    // ✅ Wrap in `data` field
    res.json({ success: true, data: user });
    return 
  } catch (error) {
    return next(error);
  }
};

/**
 * [Admin] Updates a user's details (e.g., their role).
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

/**
 * [Admin] Deletes a user from the system.
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id },
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
