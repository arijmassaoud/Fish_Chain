import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    // Get total products count
    const totalProducts = await prisma.product.count();

    // Get total categories count
    const totalCategories = await prisma.category.count();

    // Get total reservations count
    const totalReservations = await prisma.reservation.count();

    // Get reservations by status
    const reservationsByStatus = await prisma.reservation.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get total revenue (sum of all completed reservations)
    const totalRevenue = await prisma.reservation.aggregate({
      where: {
        status: 'CONFIRMED',
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get recent activities
    const recentActivities = await prisma.reservation.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json({
      totalUsers,
      usersByRole,
      totalProducts,
      totalCategories,
      totalReservations,
      reservationsByStatus,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get sales by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await prisma.reservation.groupBy({
      by: ['createdAt'],
      where: {
        status: 'CONFIRMED',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get top selling products
    const topProducts = await prisma.reservation.groupBy({
      by: ['productId'],
      where: {
        status: 'CONFIRMED',
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (product: any) => {
        const productDetails = await prisma.product.findUnique({
          where: { id: product.productId },
          select: {
            name: true,
            price: true,
          },
        });
        return {
          ...product,
          productDetails,
        };
      })
    );

    res.json({
      salesByDate,
      topProducts: topProductsWithDetails,
    });
  } catch (error) {
    next(error);
  }
}; 