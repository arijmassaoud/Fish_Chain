// backend/src/controllers/commentController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCommentsForProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { productId, parentId: null },
            include: {
                author: { select: { id: true, name: true } },
                replies: {
                    include: { author: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: comments });
    } catch (error) {
        next(error);
    }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { content, productId, parentId } = req.body;
        const authorId = req.user?.id;

        if (!authorId) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }

        const newComment = await prisma.comment.create({
            data: { content, productId, authorId, parentId },
            include: { author: { select: { id: true, name: true } } },
        });

        // Notify clients in the product room via Socket.IO
        if (req.io) {
            req.io.to(`product-comments-${productId}`).emit('new_comment', newComment);
        }

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        next(error);
    }
};

export const toggleReaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params;
        const { emoji } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            res.status(404).json({ success: false, message: 'Comment not found.' });
            return;
        }

        const reactions = (comment.reactions as { [key: string]: string[] }) || {};
        reactions[emoji] = reactions[emoji] || [];
        const userIndex = reactions[emoji].indexOf(userId);

        if (userIndex > -1) {
            reactions[emoji].splice(userIndex, 1);
            if(reactions[emoji].length === 0) delete reactions[emoji];
        } else {
            reactions[emoji].push(userId);
        }

        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: { reactions },
        });
        
        if (req.io) {
            req.io.to(`product-comments-${comment.productId}`).emit('comment_updated', updatedComment);
        }

        res.json({ success: true, data: updatedComment });
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            res.status(404).json({ success: false, message: 'Comment not found.' });
            return;
        }

        if (comment.authorId !== userId && req.user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
            return;
        }

        await prisma.comment.delete({ where: { id: commentId } });
        
        if (req.io) {
            req.io.to(`product-comments-${comment.productId}`).emit('comment_deleted', { commentId, parentId: comment.parentId });
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
