import {Request, Response,NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const sendNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
             res.status(401).json({ success: false, message: 'User not authenticated.' });
             return;
        }
        const { message, type } = req.body;

        // Create the notification with the required fields.
        const notification = await prisma.notification.create({
            data: {
                userId: req.user.id,
                message: message || 'This is a test notification.',
                type: type || 'GENERAL',
            }
        });
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};
// Get all notifications for the current user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ message: 'Not authorized to mark this notification as read' });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this notification' });
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.deleteMany({
      where: { userId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting all notifications' });
  }
}; 