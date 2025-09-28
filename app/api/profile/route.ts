import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

    // Get user profile with activities
    const profile = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        activities: {
          select: {
            id: true,
            title: true,
            type: true,
          },
          where: {
            isActive: true,
          },
        },
        applications: {
          select: {
            activity: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
          where: {
            status: 'accepted',
            activity: {
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

    // Combine created activities and joined activities
    const allActivities = [
      ...profile.activities, // Activities user created
      ...profile.applications.map(app => app.activity), // Activities user joined
    ];

    // Remove duplicates and sort
    const uniqueActivities = allActivities.filter((activity, index, self) =>
      index === self.findIndex(a => a.id === activity.id)
    );

    const profileData = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      location: profile.location,
      bio: profile.bio,
      activities: uniqueActivities,
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
        activities: {
          select: {
            id: true,
            title: true,
            type: true,
          },
          where: {
            isActive: true,
          },
        },
        applications: {
          select: {
            activity: {
              select: {
                id: true,
                title: true,
                type: true,
              },
            },
          },
          where: {
            status: 'accepted',
            activity: {
              isActive: true,
            },
          },
        },
      },
    });

    // Combine created activities and joined activities
    const allActivities = [
      ...updatedProfile.activities,
      ...updatedProfile.applications.map(app => app.activity),
    ];

    const uniqueActivities = allActivities.filter((activity, index, self) =>
      index === self.findIndex(a => a.id === activity.id)
    );

    const profileData = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      email: updatedProfile.email,
      location: updatedProfile.location,
      bio: updatedProfile.bio,
      activities: uniqueActivities,
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