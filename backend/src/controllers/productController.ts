import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { uploadToCloudinary } from '../utils/cloudinary.config';
import { productSchema } from '../validations/userValidation';

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, price, quantity, categoryId } = req.body;

        let imageUrl: string | undefined;
        if (req.file) {
            try {
                imageUrl = await uploadToCloudinary(req.file.buffer);
            } catch (cloudError) {
                console.error('Image upload failed:', cloudError);
                res.status(500).json({
                    success: false,
                    message: 'Failed to upload image to Cloudinary',
                });
                return;
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity, 10),
                categoryId,
                imageUrl,
                sellerId: req.user?.id || '',
                status: 'PENDING',
            },
            include: {
                category: true,
                seller: true,
            },
        });
        
        res.status(201).json({
            success: true,
            message: 'Product created successfully and is pending approval.',
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = '1',
            limit = '10',
            category,
            search,
            status,
            minPrice,
            maxPrice,
        } = req.query;

        const userRole = req.user?.role;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;
        const where: Prisma.ProductWhereInput = {};

        if (!userRole || userRole === 'BUYER') {
            where.status = 'AVAILABLE';
        } else if (status) {
            where.status = status as any;
        }

        if (category) where.categoryId = category as string;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    seller: { select: { id: true, name: true, email: true } },
                },
                skip,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);
        
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                seller: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        if (product.status === 'PENDING' && req.user?.role !== 'ADMIN' && req.user?.role !== 'VET' && req.user?.id !== product.sellerId) {
            res.status(404).json({ success: false, message: 'Product not found or is pending approval.' });
            return;
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = productSchema.partial().parse(req.body);

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        if (existingProduct.sellerId !== req.user?.id && req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        let newImageUrl: string | undefined;
        if (req.file) {
            try {
                newImageUrl = await uploadToCloudinary(req.file.buffer);
            } catch (cloudError) {
                res.status(500).json({ success: false, message: 'Failed to upload new image' });
                return;
            }
        }

        const updatePayload: any = { ...validatedData };
        if (validatedData.price) {
            updatePayload.price = parseFloat(validatedData.price as any);
        }
        if (validatedData.quantity) {
            updatePayload.quantity = parseInt(validatedData.quantity as any, 10);
        }
        if (newImageUrl) {
            updatePayload.imageUrl = newImageUrl;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updatePayload,
            include: {
                category: true,
                seller: { select: { id: true, name: true, email: true } },
            },
        });

        res.json({ success: true, message: 'Product updated successfully', data: product });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
            return;
        }
        next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const existingProduct = await prisma.product.findUnique({ where: { id } });

        if (!existingProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        if (existingProduct.sellerId !== req.user?.id && req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
            return;
        }

        await prisma.product.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
