import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireModerator } from '@/lib/authorization';

// GET - List all pending tag suggestions (moderator/admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const suggestions = await prisma.tagSuggestion.findMany({
      where: { status: 'PENDING' },
      include: {
        suggestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // For each suggestion, fetch parent tag names
    const suggestionsWithParents = await Promise.all(
      suggestions.map(async (suggestion) => {
        const parentTags = await prisma.tag.findMany({
          where: { id: { in: suggestion.parentTagIds } },
          select: { id: true, name: true },
        });

        return {
          ...suggestion,
          parentTags,
        };
      })
    );

    return NextResponse.json({ suggestions: suggestionsWithParents });
  } catch (error) {
    console.error('Failed to fetch tag suggestions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to fetch tag suggestions', details: errorMessage },
      { status: 500 }
    );
  }
}
