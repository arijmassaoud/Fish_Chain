// backend/src/controllers/messagesController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get the conversation between the current user and another user
// backend/src/controllers/messageController.ts

export const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId || !otherUserId) {
       res.status(400).json({ success: false, message: 'Invalid request' });
       return
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: { createdAt: 'asc' },
    });

     res.json({ success: true, data: messages });
     return
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return next(error);
  }
};
// Get a summary of all conversations for the current user
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Authentication required.' });
            return;
        }

        const conversations = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            distinct: ['senderId', 'receiverId'],
            include: {
                sender: { select: { id: true, name: true } },
                receiver: { select: { id: true, name: true } },
            },
        });
        
        // Logic to create a clean list of unique conversation partners
        const partners = new Map<string, any>();
        conversations.forEach(msg => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!partners.has(partner.id)) {
                partners.set(partner.id, {
                    ...partner,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                });
            }
        });

        res.json({ success: true, data: Array.from(partners.values()) });
    } catch (error) {
        next(error);
    }
};

// Mark all messages in a conversation as read
export const markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user?.id;

    if (!userId || !messageId) {
       res.status(400).json({ success: false, message: 'Invalid request' });
       return
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });

     res.json({ success: true, data: updatedMessage });
     return
  } catch (error) {
    console.error('Error marking message as read:', error);
    return next(error);
  }
};
