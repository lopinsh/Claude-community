import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/categories
 *
 * Fetch all Level 1 categories with metadata from database
 * This is the SINGLE SOURCE OF TRUTH for category information
 */
export async function GET() {
  try {
    const categories = await prisma.tag.findMany({
      where: {
        level: 1,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        colorKey: true,
        iconName: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
