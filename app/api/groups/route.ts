import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema for creating a group
const createGroupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  maxMembers: z.number().int().min(1).optional(),
  groupType: z.enum(['SINGLE_EVENT', 'RECURRING_GROUP']).default('SINGLE_EVENT'),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/groups - List all groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const groupType = searchParams.get('groupType')

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (groupType) {
      where.groupType = groupType
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        events: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            eventType: true,
          },
          orderBy: { startDateTime: 'asc' }
        },
        applications: {
          where: { status: 'accepted' },
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
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
        _count: {
          select: {
            applications: {
              where: { status: 'accepted' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const totalCount = await prisma.group.count({ where })

    return NextResponse.json({
      groups,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })

  } catch (error) {
    console.error('Groups fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createGroupSchema.parse(body)

    const group = await prisma.group.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        maxMembers: validatedData.maxMembers,
        groupType: validatedData.groupType,
        creatorId: session.user.id,
        tags: validatedData.tagIds ? {
          create: validatedData.tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        events: true,
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, level: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      group
    })

  } catch (error) {
    console.error('Group creation error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create group', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}