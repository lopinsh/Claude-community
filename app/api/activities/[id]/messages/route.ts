import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notifyNewMessage } from '@/lib/notifications'

// GET messages for an activity
export async function GET(
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

    const { id: activityId } = params;

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { 
        id: activityId,
        isActive: true 
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        applications: {
          where: {
            userId: user.id,
            status: 'accepted'
          }
        }
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user has access (is creator or accepted member)
    const isCreator = activity.creator.id === user.id;
    const isMember = activity.applications.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You must be a member to view messages' },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await prisma.groupMessage.findMany({
      where: {
        activityId: activityId,
      },
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
    });

    return NextResponse.json({
      activity: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        creator: activity.creator,
      },
      messages,
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new message
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

    const { id: activityId } = params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if activity exists and user has access
    const activity = await prisma.activity.findUnique({
      where: { 
        id: activityId,
        isActive: true 
      },
      include: {
        applications: {
          where: {
            userId: user.id,
            status: 'accepted'
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if user has access (is creator or accepted member)
    const isCreator = activity.creatorId === user.id;
    const isMember = activity.applications.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: 'You must be a member to send messages' },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.groupMessage.create({
      data: {
        content: content.trim(),
        userId: user.id,
        activityId: activityId,
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

// Create notifications for other members (async, don't wait)
console.log('About to call notifyNewMessage')
try {
  await notifyNewMessage(
    activityId,
    message.id,
    message.user.name || session.user.email,
    activity.title,
    user.id
  )
  console.log('notifyNewMessage completed successfully')
} catch (error) {
  console.error('Failed to create message notifications:', error)
}

return NextResponse.json({
  success: 'Message sent successfully',
  message: message,
});
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}