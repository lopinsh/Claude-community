import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Fetches the complete tag hierarchy tree (all 3 levels) with group/event counts
 */
export async function GET() {
  try {
    // Fetch all active tags with their relationships
    const allTags = await prisma.tag.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        level: true,
        parentId: true,
        _count: {
          select: {
            groups: true,
            events: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Build the tree structure
    const level1Tags = allTags.filter(tag => tag.level === 1 && !tag.parentId);

    const tree = level1Tags.map(level1 => {
      const level2Children = allTags.filter(tag => tag.level === 2 && tag.parentId === level1.id);

      return {
        ...level1,
        children: level2Children.map(level2 => {
          const level3Children = allTags.filter(tag => tag.level === 3 && tag.parentId === level2.id);

          return {
            ...level2,
            children: level3Children,
          };
        }),
      };
    });

    return NextResponse.json({ tree });
  } catch (error) {
    console.error('Error fetching tag tree:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch tag tree', details: errorMessage },
      { status: 500 }
    );
  }
}
