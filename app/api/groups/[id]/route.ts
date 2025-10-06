import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { isModerator } from '@/lib/authorization'
import { UserRole } from '@prisma/client'
import { Session } from 'next-auth'

const updateGroupSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  location: z.string().min(1).optional(),
  maxMembers: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

/**
 * Helper function to determine the user's role within a group
 */
function determineUserRole(group: any, userId: string | undefined, session: Session | null): 'visitor' | 'member' | 'owner' | 'moderator' {
  // If user is not logged in, they are a visitor
  if (!userId) return 'visitor';
  
  // Check if user is a moderator/admin (system-wide role)
  if (session && isModerator(session)) return 'moderator';
  
  // Check if user is the group owner
  if (group.creator.id === userId) return 'owner';
  
  // Check if user is a member (has approved application)
  const userApplication = group.applications.find(
    (app: any) => app.userId === userId && app.status === 'accepted'
  );
  
  return userApplication ? 'member' : 'visitor';
}

// GET /api/groups/[id] - Get group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        events: {
          orderBy: { startDateTime: 'asc' },
          include: {
            attendees: {
              include: {
                user: {
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
          }
        },
        applications: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, level: true }
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
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // If user is logged in, add their application status to the response
    const userApplication = userId 
      ? group.applications.find(app => app.userId === userId)
      : null;

    // Add user role information to the group response
    const groupWithUserRole = {
      ...group,
      userApplicationStatus: userApplication?.status || null,
      userRole: determineUserRole(group, userId, session)
    };

    return NextResponse.json({ group: groupWithUserRole })

  } catch (error) {
    console.error('Group fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/[id] - Update group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is the group creator
    const existingGroup = await prisma.group.findUnique({
      where: { id: params.id },
      select: { creatorId: true }
    })

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (existingGroup.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateGroupSchema.parse(body)

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        events: {
          orderBy: { startDateTime: 'asc' }
        },
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
      group: updatedGroup
    })

  } catch (error) {
    console.error('Group update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id] - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is the group creator
    const existingGroup = await prisma.group.findUnique({
      where: { id: params.id },
      select: { creatorId: true }
    })

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (existingGroup.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete by setting isActive to false
    await prisma.group.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
    })

  } catch (error) {
    console.error('Group deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}