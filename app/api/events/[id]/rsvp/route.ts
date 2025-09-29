import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const rsvpSchema = z.object({
  status: z.enum(['GOING', 'MAYBE', 'NOT_GOING']),
});

// POST /api/events/[id]/rsvp - RSVP to event
export async function POST(
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

    const body = await request.json();
    const { status } = rsvpSchema.parse(body);

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        group: {
          select: {
            id: true,
            creatorId: true,
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

    // Check if user is the group creator (they can't RSVP to their own events)
    if (event.group.creatorId === user.id) {
      return NextResponse.json(
        { error: 'Group owners cannot RSVP to their own events' },
        { status: 400 }
      );
    }

    // Check if event is at capacity for GOING status
    if (status === 'GOING' && event.maxMembers && event._count.attendees >= event.maxMembers) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      );
    }

    // For private events, check if user is a group member
    if (event.visibility === 'PRIVATE') {
      const isMember = await prisma.application.findFirst({
        where: {
          userId: user.id,
          groupId: event.group.id,
          status: 'ACCEPTED',
        },
      });

      if (!isMember) {
        return NextResponse.json(
          { error: 'Only group members can RSVP to private events' },
          { status: 403 }
        );
      }
    }

    // Upsert the RSVP (create or update existing)
    const rsvp = await prisma.eventAttendee.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: params.id,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        eventId: params.id,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'RSVP updated successfully',
      rsvp,
    });
  } catch (error) {
    console.error('RSVP error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid RSVP status', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id]/rsvp - Remove RSVP
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

    // Remove the RSVP
    await prisma.eventAttendee.deleteMany({
      where: {
        userId: user.id,
        eventId: params.id,
      },
    });

    return NextResponse.json({
      message: 'RSVP removed successfully',
    });
  } catch (error) {
    console.error('RSVP removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}