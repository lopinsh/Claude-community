import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  timeZone: z.string().optional(),
  eventType: z.enum(['REGULAR', 'SPECIAL', 'CANCELLED']).optional(),
  weekDay: z.number().int().min(0).max(6).optional(),
  maxMembers: z.number().int().min(1).optional(),
  location: z.string().optional(),
})

// GET /api/groups/[id]/events/[eventId] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        group: {
          select: { id: true, title: true, location: true, creator: { select: { id: true, name: true } } }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!event || event.groupId !== params.id) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })

  } catch (error) {
    console.error('Event fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/[id]/events/[eventId] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: { creatorId: true }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // Convert datetime strings to Date objects
    const updateData: any = { ...validatedData }
    if (validatedData.startDateTime) {
      updateData.startDateTime = new Date(validatedData.startDateTime)
    }
    if (validatedData.endDateTime) {
      updateData.endDateTime = new Date(validatedData.endDateTime)
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      data: updateData,
      include: {
        group: {
          select: { id: true, title: true, location: true }
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      event: updatedEvent
    })

  } catch (error) {
    console.error('Event update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/events/[eventId] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: params.id },
      select: { creatorId: true }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (group.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id: params.eventId }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Event deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}