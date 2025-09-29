import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const updateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  isAllDay: z.boolean().optional(),
  eventType: z.enum(['REGULAR', 'SPECIAL']).optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  requiresApproval: z.boolean().optional(),
  maxMembers: z.number().int().min(1).optional(),
  location: z.string().optional(),
});

// GET /api/events/[id] - Get event details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Get the event with all details
    const event = await prisma.event.findUnique({
      where: { id: params.id },
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
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (event.visibility === 'PRIVATE' && session?.user?.email) {
      // For private events, check if user is a group member
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        const isMember = await prisma.application.findFirst({
          where: {
            userId: user.id,
            groupId: event.group.id,
            status: 'ACCEPTED',
          },
        });

        const isCreator = user.id === event.group.creator.id;

        if (!isMember && !isCreator) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }
      } else if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Event fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if event exists and user is the group creator
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.group.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only group owners can edit events' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        startDateTime: validatedData.startDateTime ? new Date(validatedData.startDateTime) : undefined,
        endDateTime: validatedData.endDateTime ? new Date(validatedData.endDateTime) : undefined,
        updatedAt: new Date(),
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
        attendees: {
          include: {
            user: {
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
    });

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Event update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if event exists and user is the group creator
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.group.creatorId !== user.id) {
      return NextResponse.json(
        { error: 'Only group owners can delete events' },
        { status: 403 }
      );
    }

    // Delete the event (this will cascade delete attendees)
    await prisma.event.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Event delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}