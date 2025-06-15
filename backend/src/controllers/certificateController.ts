import {Request, Response ,NextFunction} from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all certificates
export const getAllCertificates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let certificates;
    if (userRole === 'ADMIN' || userRole === 'VET') {
      certificates = await prisma.certificate.findMany({
        include: {
          product: true,
          veterinarian: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (userRole === 'SELLER') {
      certificates = await prisma.certificate.findMany({
        where: {
          product: {
            sellerId: userId,
          },
        },
        include: {
          product: true,
          veterinarian: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      certificates = await prisma.certificate.findMany({
        where: {
          product: {
            isPublic: true,
          },
        },
        include: {
          product: true,
          veterinarian: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificates' });
  }
};

// Get certificate by ID
export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        product: true,
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!certificate) {
      res.status(404).json({ message: 'Certificate not found' });
      return;
    }

    // Check if user has permission to view this certificate
    if (userRole !== 'ADMIN' && 
        userRole !== 'VET' && 
        certificate.product.sellerId !== userId && 
        !certificate.product.isPublic) {
      res.status(403).json({ message: 'Not authorized to view this certificate' });
      return;
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching certificate' });
  }
};

// Create new certificate
export const createCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId, type, description } = req.body;
        const veterinarianId = req.user?.id; // Attached by authenticate middleware

        if (!veterinarianId) {
             res.status(401).json({ success: false, message: 'User not authenticated.' });
             return;
        }
        if (!productId || !type || !description) {
            res.status(400).json({ success: false, message: 'ProductId, type, and description are required.' });
            return;
        }

        const newCertificate = await prisma.certificate.create({
            data: {
                type,
                description,
                product: {
                    connect: { id: productId }
                },
                veterinarian: { // Correct way to connect a relation in Prisma
                    connect: { id: veterinarianId }
                }
            },
        });
        res.status(201).json({ success: true, data: newCertificate });
    } catch (error) {
        next(error);
    }
};

// Update certificate
export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, description, validUntil, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!certificate) {
      res.status(404).json({ message: 'Certificate not found' });
      return;
    }

    // Check if user has permission to update
    if (userRole !== 'ADMIN' && 
        userRole !== 'VET' && 
        certificate.vetId !== userId) {
      res.status(403).json({ message: 'Not authorized to update this certificate' });
      return;
    }

    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        type,
        description,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status,
      },
      include: {
        product: true,
        veterinarian: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for seller if status changed
    if (status && status !== certificate.status) {
      await prisma.notification.create({
        data: {
          userId: certificate.product.sellerId,
          type: 'CERTIFICATE',
          message: `Certificate status updated to ${status} for ${certificate.product.name}`,
          relatedId: certificate.id,
        },
      });
    }

    res.json(updatedCertificate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating certificate' });
  }
};

// Delete certificate (admin only)
export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!certificate) {
      res.status(404).json({ message: 'Certificate not found' });
      return;
    }

    await prisma.certificate.delete({
      where: { id },
    });

    // Create notification for seller
    await prisma.notification.create({
      data: {
        userId: certificate.product.sellerId,
        type: 'CERTIFICATE',
        message: `Certificate deleted for ${certificate.product.name}`,
        relatedId: certificate.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting certificate' });
  }
}; 