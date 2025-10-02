import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST - Create a new tag suggestion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, pendingSuggestionCount: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has reached the limit
    if (user.pendingSuggestionCount >= 5) {
      return NextResponse.json(
        { error: 'You have reached the maximum of 5 pending suggestions' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { nameEn, nameLv, parentTagIds } = body;

    // Validation
    if (!nameEn || !nameLv || !parentTagIds || parentTagIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: nameEn, nameLv, parentTagIds' },
        { status: 400 }
      );
    }

    // Check for duplicate suggestions (case-insensitive)
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: nameEn, mode: 'insensitive' } },
          { name: { equals: nameLv, mode: 'insensitive' } },
        ],
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate pending suggestions
    const existingSuggestion = await prisma.tagSuggestion.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { nameEn: { equals: nameEn, mode: 'insensitive' } },
          { nameLv: { equals: nameLv, mode: 'insensitive' } },
        ],
      },
    });

    if (existingSuggestion) {
      return NextResponse.json(
        { error: 'A similar suggestion is already pending review' },
        { status: 409 }
      );
    }

    // Verify parent tags exist and are Level 2
    const parentTags = await prisma.tag.findMany({
      where: {
        id: { in: parentTagIds },
        level: 2,
        status: 'ACTIVE',
      },
    });

    if (parentTags.length !== parentTagIds.length) {
      return NextResponse.json(
        { error: 'One or more parent tags are invalid' },
        { status: 400 }
      );
    }

    // Create the suggestion in a transaction (update user count + create suggestion)
    const suggestion = await prisma.$transaction(async (tx) => {
      // Create suggestion
      const newSuggestion = await tx.tagSuggestion.create({
        data: {
          nameEn,
          nameLv,
          level: 3,
          parentTagIds,
          suggestedById: user.id,
          status: 'PENDING',
        },
      });

      // Increment user's pending count
      await tx.user.update({
        where: { id: user.id },
        data: { pendingSuggestionCount: { increment: 1 } },
      });

      return newSuggestion;
    });

    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error) {
    console.error('Tag suggestion creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to create tag suggestion', details: errorMessage },
      { status: 500 }
    );
  }
}
