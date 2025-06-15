// backend/src/controllers/categoryController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { uploadToCloudinary } from '../utils/cloudinary.config';

const prisma = new PrismaClient();

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        let imageUrl: string | undefined;

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        const category = await prisma.category.create({
            data: {
                name,
                description: description || null,
                imageUrl,
            },
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(409).json({ success: false, message: 'A category with this name already exists.' });
            return;
        }
        next(error);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const category = await prisma.category.findUnique({
            where: { id },
            include: { products: { where: { status: 'AVAILABLE' } } },
        });

        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }
        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        let imageUrl: string | undefined;

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer);
        }

        const updateData: Prisma.CategoryUpdateInput = { name, description };
        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        res.json({ success: true, data: updatedCategory });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Category not found.' });
            return;
        }
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            res.status(404).json({ success: false, message: 'Category not found.' });
            return;
        }
        next(error);
    }
};
