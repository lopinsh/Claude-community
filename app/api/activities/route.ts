import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// You MUST ensure this path is correct and this file exports authOptions
import { authOptions } from '@/lib/auth'; // <-- This must be the correct import location
import { prisma } from '@/lib/prisma';
import { z } from 'zod'; 

// ====================================================================
// ZOD Schema Helpers
// ====================================================================

// Helper function to safely parse string to number or return null
const safeNumber = z.preprocess(
    (a) => {
        // If the value is an empty string, treat it as null (for the .nullable() call)
        if (typeof a === 'string' && a.trim() === '') return null;
        // Otherwise, try to convert it to a number
        return Number(a);
    },
    // The resulting Zod type: a number that must be an integer, and is nullable.
    z.number().int('Must be a whole number').nullable()
);

// Handles the "In-Person" vs "InPerson" discrepancy
const activityTypeEnum = z.preprocess(
    (val) => {
        if (typeof val === 'string') {
            // Converts "In-Person" to "InPerson" for the database enum
            return val.replace('-', ''); 
        }
        return val;
    },
    z.enum(['Online', 'InPerson', 'Hybrid', 'Other'])
);

// ====================================================================
// ZOD Schema for POST Request Validation
// ====================================================================
const createActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  
  // FIX: Use the new activityTypeEnum helper here
  type: activityTypeEnum,
  
  location: z.string().min(3, 'Location is required.'),
  maxMembers: safeNumber,
  tagIds: z.array(z.string()).min(1, 'At least one tag (Level 1) is required.'),
});

// ====================================================================
// GET Handler: Fetch and Filter Activities
// ====================================================================
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        // If session is required for GET, return 401. 
        // Based on the code structure, we assume authentication is required.
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const tagId = searchParams.get('tagId'); 

        let whereClause: any = { isActive: true };

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
                description: true, 
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

        // The activities are returned within an object named 'activities'
        return NextResponse.json({ activities }, { status: 200 }); 
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
      // Log the validation details to the console to help with debugging
      console.error('Zod Validation Error Details:', JSON.stringify(error.errors, null, 2)); 
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
