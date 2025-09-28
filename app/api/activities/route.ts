// app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// You MUST ensure this path is correct and this file exports authOptions
import { authOptions } from '@/lib/auth'; 
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; 

// ====================================================================
// ZOD Schema for POST Request Validation
// ====================================================================
const createActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  type: z.enum(['Online', 'InPerson', 'Hybrid', 'Other']),
  location: z.string().min(3, 'Location is required.'),
  maxMembers: z.number().int().nullable(),
  tagIds: z.array(z.string()).min(1, 'At least one tag (Level 1) is required.'),
});

// ====================================================================
// GET Handler: Fetch and Filter Activities
// ====================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    let whereClause: any = { isActive: true };

    // CONDITIONAL FILTERING LOGIC
    if (tagId) {
      whereClause.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true, // FIXED: Comma added and duplicate removed
        type: true,
        location: true,
        maxMembers: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: {
              where: { status: 'accepted' },
            },
          },
        },
        tags: { 
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                level: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown server error occurred.';
      
    return NextResponse.json({ 
        error: 'Failed to fetch activities', 
        details: errorMessage 
    }, { status: 500 });
  }
}


// ====================================================================
// POST Handler: Create a New Activity
// ====================================================================
export async function POST(request: NextRequest) {
  // Use getServerSession to get the user session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createActivitySchema.parse(body);

    const { tagIds, ...activityData } = validatedData;
    
    const newActivity = await prisma.activity.create({
      data: {
        ...activityData,
        creatorId: session.user.id, 
        tags: {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
    });

    await prisma.tag.updateMany({
        where: {
            id: { in: tagIds }
        },
        data: {
            usageCount: { increment: 1 }
        }
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 });
    }
    
    console.error('Error creating activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during creation.';

    return NextResponse.json({ 
        error: 'Activity creation failed', 
        details: errorMessage 
    }, { status: 500 });
  }
}