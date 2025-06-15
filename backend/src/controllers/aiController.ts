import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Tool: /getProductDetails productId=...
const prisma = new PrismaClient();
export const getProductDetails = async (req: Request, res: Response) => {
  const { productId } = req.query;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId as string },
      include: {
        category: true,
        seller: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
};

// Tool: /deleteProduct productId=...
export const deleteProduct = async (req: Request, res: Response) => {
  const { productId } = req.params;

  // Check if user is authenticated and has correct role
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SELLER')) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Tool: /listProducts
export const listProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
      },
    });

    res.json(products);
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ message: 'Failed to list products' });
  }
};


