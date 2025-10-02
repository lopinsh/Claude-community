import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime().optional(),
  isAllDay: z.boolean().default(false),
  timeZone: z.string().default('Europe/Riga'),
  eventType: z.enum(['REGULAR', 'SPECIAL', 'CANCELLED']).default('REGULAR'),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  requiresApproval: z.boolean().default(false),
  maxMembers: z.number().int().min(1).optional(),
  location: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.enum(['ONCE', 'WEEKLY', 'MONTHLY']).default('ONCE'),
  recurrenceEnd: z.string().datetime().optional(),
  weekDays: z.array(z.number().int().min(0).max(6)).optional(),
  monthlyDay: z.number().int().min(1).max(31).optional(),
})

// GET /api/groups/[id]/events - Get all events for a group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const eventType = searchParams.get('eventType')

    const where: any = {
      groupId: params.id,
    }

    if (fromDate) {
      where.startDateTime = {
        gte: new Date(fromDate)
      }
    }

    if (toDate) {
      where.startDateTime = {
        ...where.startDateTime,
        lte: new Date(toDate)
      }
    }

    if (eventType) {
      where.eventType = eventType
    }

    const events = await prisma.event.findMany({
      where,
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
        },
        _count: {
          select: {
            attendees: {
              where: { status: 'GOING' }
            }
          }
        }
      },
      orderBy: { startDateTime: 'asc' }
    })

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/groups/[id]/events - Create a new event for the group
export async function POST(
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

    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Only include fields that exist in the Event model
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDateTime: new Date(validatedData.startDateTime),
        endDateTime: validatedData.endDateTime ? new Date(validatedData.endDateTime) : null,
        isAllDay: validatedData.isAllDay,
        timeZone: validatedData.timeZone,
        eventType: validatedData.eventType,
        visibility: validatedData.visibility,
        requiresApproval: validatedData.requiresApproval,
        maxMembers: validatedData.maxMembers,
        location: validatedData.location,
        // Map weekDays array to single weekDay if provided
        weekDay: validatedData.weekDays && validatedData.weekDays.length > 0 ? validatedData.weekDays[0] : undefined,
        groupId: params.id,
      },
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
      event
    })

  } catch (error) {
    console.error('Event creation error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create event', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}