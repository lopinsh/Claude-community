import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/discover - Get groups and events for main page (public + user's private events)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const categories = searchParams.get('categories')
    const level2 = searchParams.get('level2')
    const level3 = searchParams.get('level3')
    const location = searchParams.get('location')
    const type = searchParams.get('type') // 'groups', 'events', or 'all'

    // Build where conditions
    const whereConditions: any = {
      isActive: true,
    }

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location) {
      whereConditions.location = location
    }

    // Multi-level category filtering
    const tagConditions: any[] = []

    // Level 1 category filtering
    if (categories) {
      const categoryList = categories.split(',')
      const categoryNames = categoryList.map(cat =>
        cat.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ').replace('Craft', '& Craft').replace('Wellness', '& Wellness').replace('Fun', '& Fun').replace('Spectacle', '& Spectacle').replace('Governance', '& Governance').replace('Resource', '& Resource')
      )

      tagConditions.push({
        tag: {
          name: { in: categoryNames },
          level: 1
        }
      })
    }

    // Level 2 category filtering
    if (level2) {
      const level2Ids = level2.split(',')
      tagConditions.push({
        tag: {
          id: { in: level2Ids },
          level: 2
        }
      })
    }

    // Level 3 category filtering
    if (level3) {
      const level3Ids = level3.split(',')
      tagConditions.push({
        tag: {
          id: { in: level3Ids },
          level: 3
        }
      })
    }

    // Apply tag filtering if any level is selected
    if (tagConditions.length > 0) {
      // Each tag condition should be a separate "some" requirement
      whereConditions.AND = tagConditions.map(condition => ({
        tags: {
          some: condition
        }
      }))
    }

    // Get groups
    let groups: any[] = []
    if (type !== 'events') {
      groups = await prisma.group.findMany({
        where: whereConditions,
        include: {
          creator: {
            select: { id: true, name: true }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  level: true,
                  parentId: true,
                  parent: {
                    select: {
                      id: true,
                      name: true,
                      level: true,
                      parentId: true,
                      parent: {
                        select: {
                          id: true,
                          name: true,
                          level: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          events: {
            where: {
              visibility: 'PUBLIC',
              startDateTime: {
                gte: new Date()
              }
            },
            take: 3, // Show next 3 public events
            orderBy: { startDateTime: 'asc' },
            select: {
              id: true,
              title: true,
              startDateTime: true,
              endDateTime: true,
              eventType: true,
              visibility: true
            }
          },
          _count: {
            select: {
              applications: {
                where: { status: 'accepted' }
              },
              events: {
                where: {
                  visibility: 'PUBLIC',
                  startDateTime: {
                    gte: new Date()
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })

    }

    // Get events (public + private for authenticated users)
    let publicEvents: any[] = []
    if (type !== 'groups') {
      const eventWhereConditions: any = {
        startDateTime: {
          gte: new Date()
        },
        group: {
          isActive: true
        }
      }

      // For authenticated users, include private events from their groups
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });

        if (user) {
          const userApplications = await prisma.application.findMany({
            where: {
              userId: user.id,
              status: 'ACCEPTED',
            },
            select: { groupId: true },
          });

          const userGroupIds = userApplications.map(app => app.groupId);

          eventWhereConditions.OR = [
            { visibility: 'PUBLIC' }, // All public events
            { groupId: { in: userGroupIds } }, // Events from user's groups
          ];
        } else {
          eventWhereConditions.visibility = 'PUBLIC';
        }
      } else {
        // For unauthenticated users, only show public events
        eventWhereConditions.visibility = 'PUBLIC';
      }

      if (search) {
        const searchConditions = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { group: { title: { contains: search, mode: 'insensitive' } } }
        ];

        if (eventWhereConditions.OR) {
          // If we already have OR conditions for visibility, wrap them
          eventWhereConditions.AND = [
            { OR: eventWhereConditions.OR },
            { OR: searchConditions }
          ];
          delete eventWhereConditions.OR;
        } else {
          eventWhereConditions.OR = searchConditions;
        }
      }

      if (location) {
        const locationConditions = [
          { location: location },
          { group: { location: location } }
        ];

        if (eventWhereConditions.AND) {
          eventWhereConditions.AND.push({ OR: locationConditions });
        } else if (eventWhereConditions.OR && search) {
          eventWhereConditions.AND = [
            { OR: eventWhereConditions.OR },
            { OR: locationConditions }
          ];
          delete eventWhereConditions.OR;
        } else {
          eventWhereConditions.OR = [...(eventWhereConditions.OR || []), ...locationConditions];
        }
      }

      publicEvents = await prisma.event.findMany({
        where: eventWhereConditions,
        include: {
          group: {
            select: {
              id: true,
              title: true,
              location: true,
              creator: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: {
              attendees: {
                where: { status: 'GOING' }
              }
            }
          }
        },
        orderBy: { startDateTime: 'asc' },
        take: 20
      })
    }

    return NextResponse.json({
      groups,
      publicEvents,
      summary: {
        totalGroups: groups.length,
        totalPublicEvents: publicEvents.length,
      }
    })

  } catch (error) {
    console.error('Discover fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups and events' },
      { status: 500 }
    )
  }
}