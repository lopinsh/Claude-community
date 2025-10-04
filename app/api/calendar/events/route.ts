import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { denormalizeCategoryNames } from '@/lib/tagUtils';

// GET - Get calendar events (public events + user's group events)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const eventType = searchParams.get('eventType');
    const search = searchParams.get('search');
    const categoriesParam = searchParams.get('categories');
    const level2Param = searchParams.get('level2');
    const level3Param = searchParams.get('level3');
    const location = searchParams.get('location');

    const session = await getServerSession(authOptions);

    // Build where clause
    const where: any = {
      eventType: { not: 'CANCELLED' }, // Exclude cancelled events
    };

    // Build group filter for tags and location
    const groupWhere: any = {};

    // Location filtering
    if (location) {
      groupWhere.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    // Search filtering (searches event title/description and group title)
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          group: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Tag filtering (filter by group tags)
    const tagFilters: any[] = [];

    if (categoriesParam) {
      const normalizedCategories = categoriesParam.split(',');
      // Convert normalized names (e.g., "skill-craft") to actual database names (e.g., "Skill & Craft")
      const actualCategories = await denormalizeCategoryNames(normalizedCategories);

      if (actualCategories.length > 0) {
        tagFilters.push({
          tags: {
            some: {
              tag: {
                name: {
                  in: actualCategories,
                },
              },
            },
          },
        });
      }
    }

    if (level2Param) {
      const level2Ids = level2Param.split(',');
      tagFilters.push({
        tags: {
          some: {
            tagId: {
              in: level2Ids,
            },
          },
        },
      });
    }

    if (level3Param) {
      const level3Ids = level3Param.split(',');
      tagFilters.push({
        tags: {
          some: {
            tagId: {
              in: level3Ids,
            },
          },
        },
      });
    }

    // Apply tag filters to group where clause
    if (tagFilters.length > 0) {
      groupWhere.AND = tagFilters;
    }

    // Add group filter to main where clause if any group filters exist
    if (Object.keys(groupWhere).length > 0) {
      where.group = groupWhere;
    }

    // Date filtering
    if (fromDate) {
      where.startDateTime = {
        gte: new Date(fromDate)
      };
    }

    if (toDate) {
      where.startDateTime = {
        ...where.startDateTime,
        lte: new Date(toDate)
      };
    }

    // Event type filtering
    if (eventType && eventType !== '') {
      where.eventType = eventType;
    }

    let events;

    if (session?.user?.email) {
      // For authenticated users: get public events + events from groups they belong to
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        // Get user's group memberships
        const userApplications = await prisma.application.findMany({
          where: {
            userId: user.id,
            status: 'ACCEPTED',
          },
          select: { groupId: true },
        });

        const userGroupIds = userApplications.map(app => app.groupId);

        events = await prisma.event.findMany({
          where: {
            ...where,
            OR: [
              { visibility: 'PUBLIC' }, // All public events
              { groupId: { in: userGroupIds } }, // Events from user's groups
            ],
          },
          include: {
            group: {
              select: {
                id: true,
                title: true,
                location: true,
                creator: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                attendees: {
                  where: { status: 'GOING' },
                },
              },
            },
          },
          orderBy: {
            startDateTime: 'asc',
          },
        });
      } else {
        // User not found, show only public events
        events = await prisma.event.findMany({
          where: {
            ...where,
            visibility: 'PUBLIC',
          },
          include: {
            group: {
              select: {
                id: true,
                title: true,
                location: true,
                creator: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            _count: {
              select: {
                attendees: {
                  where: { status: 'GOING' },
                },
              },
            },
          },
          orderBy: {
            startDateTime: 'asc',
          },
        });
      }
    } else {
      // For unauthenticated users: only show public events
      events = await prisma.event.findMany({
        where: {
          ...where,
          visibility: 'PUBLIC',
        },
        include: {
          group: {
            select: {
              id: true,
              title: true,
              location: true,
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              attendees: {
                where: { status: 'GOING' },
              },
            },
          },
        },
        orderBy: {
          startDateTime: 'asc',
        },
      });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Calendar events fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}