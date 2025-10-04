import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rankByRelevance } from '@/lib/fuzzy-match';

/**
 * GET /api/tags/search
 *
 * Fuzzy search for tags
 *
 * Query params:
 * - q: Search query (required)
 * - level: Tag level filter (1, 2, or 3) (optional)
 * - limit: Max results (default 5)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const levelParam = searchParams.get('level');
    const limitParam = searchParams.get('limit');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const level = levelParam ? parseInt(levelParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : 5;

    // Fetch tags from database with hierarchical path
    const tags = await prisma.tag.findMany({
      where: {
        status: 'ACTIVE',
        ...(level ? { level } : {}),
      },
      select: {
        id: true,
        name: true,
        level: true,
        colorKey: true,
        iconName: true,
        description: true,
        // Include parent relationships for hierarchy
        childTagParents: {
          where: {
            isPrimary: true, // Only get primary parent path
          },
          select: {
            parent: {
              select: {
                id: true,
                name: true,
                level: true,
                childTagParents: {
                  where: {
                    isPrimary: true,
                  },
                  select: {
                    parent: {
                      select: {
                        id: true,
                        name: true,
                        level: true,
                        colorKey: true,
                        iconName: true,
                        description: true,
                      },
                    },
                    l1Category: true,
                    l1ColorKey: true,
                  },
                },
              },
            },
            l1Category: true,
            l1ColorKey: true,
          },
        },
      },
      // Fetch more than needed for fuzzy ranking
      take: Math.min(limit * 10, 100),
    });

    // Transform tags to include hierarchical path
    const tagsWithHierarchy = tags.map((tag) => {
      // Build hierarchy path: L1 > L2 > L3
      let hierarchy = null;

      if (tag.childTagParents && tag.childTagParents.length > 0) {
        const primaryParent = tag.childTagParents[0];
        const l2 = primaryParent.parent;

        // Get L1 from L2's parent
        let l1 = null;
        if (l2.childTagParents && l2.childTagParents.length > 0) {
          l1 = l2.childTagParents[0].parent;
        }

        hierarchy = {
          l1: l1 ? {
            id: l1.id,
            name: l1.name,
            colorKey: l1.colorKey,
            iconName: l1.iconName,
            description: l1.description,
          } : {
            name: primaryParent.l1Category,
            colorKey: primaryParent.l1ColorKey,
          },
          l2: {
            id: l2.id,
            name: l2.name,
          },
          l3: {
            id: tag.id,
            name: tag.name,
          },
          // Formatted path for display: "Movement & Wellness > Team Sports > Basketball"
          path: l1
            ? `${l1.name} > ${l2.name} > ${tag.name}`
            : `${primaryParent.l1Category} > ${l2.name} > ${tag.name}`,
          // Primary color key for styling
          colorKey: l1?.colorKey || primaryParent.l1ColorKey,
        };
      }

      return {
        id: tag.id,
        name: tag.name,
        level: tag.level,
        colorKey: tag.colorKey,
        iconName: tag.iconName,
        description: tag.description,
        hierarchy,
      };
    });

    // Rank by relevance using fuzzy matching
    const rankedTags = rankByRelevance(query, tagsWithHierarchy, (tag) => tag.name);

    // Return limited results
    return NextResponse.json({
      tags: rankedTags.slice(0, limit),
      total: rankedTags.length,
    });
  } catch (error) {
    console.error('Error searching tags:', error);
    return NextResponse.json(
      { error: 'Failed to search tags' },
      { status: 500 }
    );
  }
}
