// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
// Export all types from the Prisma client package for better type safety across the app
export * from '@prisma/client'; 

// This prevents multiple PrismaClient instances in development mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  // Optionally, enable logging for debugging
  // log: ['query', 'error', 'warn'], 
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;