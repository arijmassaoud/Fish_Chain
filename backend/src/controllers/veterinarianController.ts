// backend/src/controllers/veterinarianController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, ProductStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Helper type guard to check if a string is a valid ProductStatus
const isProductStatus = (value: any): value is ProductStatus => {
  return ['PENDING', 'AVAILABLE', 'REJECTED', 'SOLD'].includes(value);
};

// Get all products, with an optional filter by status
export const getAllProductsForVet = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.query;
  const where: Prisma.ProductWhereInput = {};

  if (status) {
    const upperCaseStatus = String(status).toUpperCase();
    if (isProductStatus(upperCaseStatus)) {
      where.status = upperCaseStatus;
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid status value provided. Must be one of: PENDING, AVAILABLE, REJECTED, SOLD",
      });
      return;
    }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, email: true }
        }
      },
    });
    // Send response without returning it
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products for vet:', error);
    // Pass error to the error handling middleware
    next(error);
  }
};

// Review a product by approving or rejecting it
export const reviewProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { decision, rejectionReason } = req.body;

  if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
    res.status(400).json({ success: false, message: 'Invalid or missing decision. Must be APPROVE or REJECT.' });
    return;
  }

  try {
    const updateData: Prisma.ProductUpdateInput = {};

    if (decision === 'APPROVE') {
      updateData.status = 'AVAILABLE';
      updateData.rejectionReason = null;
    } else {
      if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim() === '') {
        res.status(400).json({ success: false, message: 'A non-empty rejection reason is required.' });
        return;
      }
      updateData.status = 'REJECTED';
      updateData.rejectionReason = rejectionReason;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    res.json({ success: true, message: `Product has been ${decision.toLowerCase()}d.`, data: updatedProduct });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
       res.status(404).json({ success: false, message: 'Product not found.' });
       return;
    }
    console.error('Error reviewing product:', error);
    next(error);
  }
};
