// backend/src/controllers/reservationsController.ts

import { Request, Response, NextFunction } from 'express';
// Import the ReservationStatus enum from the Prisma client for type-safe comparisons
import { PrismaClient, ReservationStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new reservation for a product
export const createReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication is required.' });
            return;
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product || product.status !== 'AVAILABLE') {
            res.status(404).json({ success: false, message: 'Product is not available for reservation.' });
            return;
        }
        if (product.quantity < quantity) {
            res.status(400).json({ success: false, message: 'Not enough stock available.' });
            return;
        }

        // Create the reservation in the database
        const reservation = await prisma.reservation.create({
            data: {
                productId,
                buyerId: userId, 
                userId: userId, // FIX: Added the required 'userId' field to match the schema.
                quantity,
                totalAmount: product.price * quantity,
                status: 'PENDING',
            },
        });

        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        next(error);
    }
};

// Get all reservations (for admins or a specific user)
export const getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        let where = {};

        // Tailor the query based on the user's role
        if (user?.role === 'BUYER') {
            where = { buyerId: user.id }; 
        } else if (user?.role === 'SELLER') {
            where = { product: { sellerId: user.id } };
        }
        // Admins can see all reservations, so no filter is applied for them.

        const reservations = await prisma.reservation.findMany({
            where,
            include: { 
                product: { include: { seller: { select: { name: true, id: true } } } }, 
                buyer: { select: { name: true, id: true } } 
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: reservations });
    } catch (error) {
        next(error);
    }
};

// Update the status of a reservation
export const updateReservationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g., "DELIVERED"
        const user = req.user;

        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: { product: true },
        });

        if (!reservation) {
            res.status(404).json({ success: false, message: 'Reservation not found.' });
            return;
        }

        // Authorize the update: only the product's seller or an admin can modify it.
        if (user?.role !== 'ADMIN' && user?.id !== reservation.product.sellerId) {
            res.status(403).json({ success: false, message: 'You are not authorized to update this reservation.' });
            return;
        }
        
        // When a reservation is marked as delivered, decrement the product's stock.
        // This check prevents the stock from being decremented multiple times for the same reservation.
        if (status === ReservationStatus.DELIVERED && reservation.status !== ReservationStatus.DELIVERED) {
             await prisma.product.update({
                where: { id: reservation.productId },
                data: { quantity: { decrement: reservation.quantity } },
            });
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id },
            data: { status },
        });

        res.json({ success: true, data: updatedReservation });
    } catch (error) {
        next(error);
    }
};
