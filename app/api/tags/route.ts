// app/api/tags/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

/**
 * Handles GET requests to fetch tags based on level or parentId.
 * - /api/tags?level=1: Fetches all Level 1 tags.
 * - /api/tags?parentId=[id]: Fetches all children tags linked to the given parent ID.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const levelParam = searchParams.get('level');
    const parentId = searchParams.get('parentId');

    let whereClause: any = { status: 'ACTIVE' };
    
    // Case 1: Fetch tags by a specific level (used for L1 tags)
    if (levelParam) {
      const level = parseInt(levelParam);
      if (!isNaN(level) && level >= 1 && level <= 3) {
        whereClause.level = level;
      }
    } 
    // Case 2: Fetch children of a parent ID (used for L2/L3 dynamic filtering)
    else if (parentId) {
      // Logic for the many-to-many relationship using the TagRelation join table
      whereClause.childRelations = {
        some: {
          parentId: parentId,
        },
      };
    }
    
    // If no specific filter (level or parentId) is applied, it will return all ACTIVE tags, 
    // but the front-end only requests specific filters.

    const tags = await prisma.tag.findMany({
      where: whereClause,
      select: { 
        id: true, 
        name: true, 
        level: true 
      },
      orderBy: { name: 'asc' },
    });
    
    // Log the result to your server console to confirm the API is working
    if (levelParam === '1') {
      console.log(`[TAG API] Found ${tags.length} Level 1 tags.`);
    }

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    
    // FIX: Safely determine the error message by checking if 'error' is an Error instance
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown server error occurred.';

    return NextResponse.json({ 
        error: 'Failed to fetch tags', 
        details: errorMessage // Use the safely-extracted message
    }, { status: 500 });
  }
}