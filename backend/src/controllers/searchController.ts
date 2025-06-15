// backend/src/controllers/searchController.ts
import { Request, Response, NextFunction } from 'express';

import { interpretSearchQuery } from './aiSearch';
import { Prisma } from '@prisma/client';

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export const searchEverything = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) {
       res.status(400).json({ success: false, message: 'Search query is required.' });
       return
    }

    // 1. Get structured parameters from the AI service
    const searchParams = await interpretSearchQuery(query);

    // 2. Build a dynamic Prisma query based on AI output
    const prismaQuery: Prisma.ProductWhereInput = {
      AND: [], // We build our query by adding conditions to this array
    };

    if (searchParams.searchTerm) {
      (prismaQuery.AND as Prisma.ProductWhereInput[]).push({
        OR: [
          { name: { contains: searchParams.searchTerm, mode: 'insensitive' } },
          { description: { contains: searchParams.searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    if (searchParams.category) {
      (prismaQuery.AND as Prisma.ProductWhereInput[]).push({
        category: { name: { contains: searchParams.category, mode: 'insensitive' } },
      });
    }
    
    if (searchParams.attributes && searchParams.attributes.length > 0) {
        searchParams.attributes.forEach((attr: string) => {
            (prismaQuery.AND as Prisma.ProductWhereInput[]).push({
                description: { contains: attr, mode: 'insensitive' },
            });
        });
    }

    if (searchParams.minPrice) {
        (prismaQuery.AND as Prisma.ProductWhereInput[]).push({
            price: { gte: searchParams.minPrice },
        });
    }
    
    if (searchParams.maxPrice) {
        (prismaQuery.AND as Prisma.ProductWhereInput[]).push({
            price: { lte: searchParams.maxPrice },
        });
    }

    // 3. Execute the database query
    const results = await prisma.product.findMany({
      where: prismaQuery,
      include: {
        category: true, // Include related data as needed
      },
      take: 20, // Limit the number of results
    });

    res.status(200).json({ success: true, data: results });

  } catch (error) {
    next(error);
  }
};