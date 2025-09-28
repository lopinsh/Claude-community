import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, description, type, location, maxMembers } = await request.json();

    // Validate input
    if (!title || !type || !location) {
      return NextResponse.json(
        { error: 'Title, type, and location are required' },
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

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        type,
        location,
        maxMembers,
        creatorId: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: {
                status: 'accepted',
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: {
                status: 'accepted',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}