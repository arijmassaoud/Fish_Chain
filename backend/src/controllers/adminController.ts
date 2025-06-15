// backend/src/controllers/adminController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * [Admin] Controller to get statistics for the admin dashboard.
 */
export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        const pendingProducts = await prisma.product.count({ where: { status: ProductStatus.PENDING }});
        
        res.json({
            success: true,
            data: {
                totalUsers: userCount,
                totalProducts: productCount,
                pendingApproval: pendingProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * [Admin] Gets a list of all users.
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            // FIX: Removed 'isActive' as it does not exist on the User model.
            // To use this, add `isActive Boolean @default(true)` to your schema.prisma.
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

/**
 * [Admin] Updates the role of a specific user.
 */
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'SELLER', 'BUYER', 'VET'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role specified.' });
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
};

/**
 * [Admin] Deactivates or reactivates a user's account.
 * FIX: This function is commented out because the 'isActive' field is missing
 * from your User model in schema.prisma. To enable this feature, please add
 * `isActive Boolean @default(true)` to your User model and run `npx prisma generate`.
 */
/*
export const setUserActivation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            res.status(400).json({ success: false, message: 'isActive must be a boolean value.' });
            return;
        }
        
        const user = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: { id: true, name: true, isActive: true },
        });

        res.json({ success: true, message: `User has been ${isActive ? 'activated' : 'deactivated'}.`, data: user });
    } catch (error) {
        next(error);
    }
};
*/

/**
 * [Admin] Gets recent activity logs from the system.
 */
export const getSystemActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recentProducts = await prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { seller: { select: { name: true } } },
        });
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: {
                recentUsers,
                recentProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const totalUsers = await prisma.user.count();
        const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: { id: true } });
        const totalProducts = await prisma.product.count();
        const totalReservations = await prisma.reservation.count();
        const reservationsByStatus = await prisma.reservation.groupBy({ by: ['status'], _sum: { totalAmount: true } });
        
        const totalRevenueResult = await prisma.reservation.aggregate({
            where: { status: 'CONFIRMED' },
            _sum: { totalAmount: true },
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                usersByRole,
                totalProducts,
                totalReservations,
                reservationsByStatus, // Utilisé pour le graphique de revenus
                totalRevenue: totalRevenueResult._sum.totalAmount || 0,
            }
        });
    } catch (error) {
        next(error);
    }
};

// Ce contrôleur fournit les listes d'activités récentes.
