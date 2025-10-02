import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile with groups
    const profile = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        groups: {
          select: {
            id: true,
            title: true,
          },
          where: {
            isActive: true,
          },
        },
        applications: {
          select: {
            group: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          where: {
            status: 'ACCEPTED',
            group: {
              isActive: true,
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Combine owned groups and accepted applications
    const activities = [
      ...profile.groups,
      ...profile.applications.map(app => app.group)
    ];

    const profileData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      location: profile.location,
      bio: profile.bio,
      activities: activities,
    };

    return NextResponse.json({ profile: profileData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, location, bio } = await request.json();

    // Update user profile
    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || null,
        location: location || null,
        bio: bio || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        groups: {
          select: {
            id: true,
            title: true,
          },
          where: {
            isActive: true,
          },
        },
        applications: {
          select: {
            group: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          where: {
            status: 'ACCEPTED',
            group: {
              isActive: true,
            },
          },
        },
      },
    });

    // Combine owned groups and accepted applications
    const activities = [
      ...updatedProfile.groups,
      ...updatedProfile.applications.map(app => app.group)
    ];

    const profileData = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      location: updatedProfile.location,
      bio: updatedProfile.bio,
      activities: activities,
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: profileData,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}