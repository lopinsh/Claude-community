import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/groups/[id]/applications - Get applications for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: { creatorId: true, title: true }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const applications = await prisma.application.findMany({
      where: { groupId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      group: {
        id: group.creatorId,
        title: group.title
      },
      applications
    })

  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/groups/[id]/applications - Apply to join a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        creatorId: true,
        maxMembers: true,
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

    // Check if user is trying to apply to their own group
    if (group.creatorId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot apply to your own group' },
        { status: 400 }
      )
    }

    // Check if group is full
    if (group.maxMembers && group._count.applications >= group.maxMembers) {
      return NextResponse.json(
        { error: 'Group is full' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        groupId: params.id,
        message: message || null,
        status: 'pending'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        group: {
          select: { id: true, title: true }
        }
      }
    })

    // TODO: Create notification for group creator
    // await notifyNewApplication(group.creatorId, group.title, application.id, params.id)

    return NextResponse.json({
      success: true,
      application
    })

  } catch (error) {
    console.error('Application submission error:', error)

    // Handle specific Prisma errors
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already applied to this group' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}