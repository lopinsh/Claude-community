import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireModerator } from '@/lib/authorization';

// PATCH - Approve, deny, or merge a tag suggestion (moderator/admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const moderatorId = session.user.id;

    const suggestionId = params.id;
    const body = await request.json();
    const { action, moderatorNotes, mergedIntoTagId } = body;

    // Validate action
    if (!['approve', 'deny', 'merge'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Fetch the suggestion
    const suggestion = await prisma.tagSuggestion.findUnique({
      where: { id: suggestionId },
      include: { suggestedBy: true },
    });

    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    if (suggestion.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Suggestion has already been reviewed' },
        { status: 400 }
      );
    }

    let result;
    let notificationType: 'TAG_SUGGESTION_APPROVED' | 'TAG_SUGGESTION_DENIED' | 'TAG_SUGGESTION_MERGED' = 'TAG_SUGGESTION_APPROVED';
    let notificationMessage = '';

    if (action === 'approve') {
      // Create the tag
      result = await prisma.$transaction(async (tx) => {
        const newTag = await tx.tag.create({
          data: {
            name: suggestion.nameEn, // Use English name as primary
            level: 3,
            parentId: suggestion.parentTagIds[0], // Use first parent as primary
            status: 'ACTIVE',
          },
        });

        // Update suggestion status
        await tx.tagSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: 'APPROVED',
            moderatedById: moderatorId,
            moderatedAt: new Date(),
            moderatorNotes,
          },
        });

        // Decrement user's pending count
        await tx.user.update({
          where: { id: suggestion.suggestedById },
          data: { pendingSuggestionCount: { decrement: 1 } },
        });

        // Create notification
        await tx.notification.create({
          data: {
            type: 'TAG_SUGGESTION_APPROVED',
            title: 'Tag Suggestion Approved',
            message: `Your suggestion "${suggestion.nameEn}" has been approved and added to the taxonomy!`,
            userId: suggestion.suggestedById,
          },
        });

        return { tag: newTag, suggestion };
      });

      notificationType = 'TAG_SUGGESTION_APPROVED';
      notificationMessage = `Your suggestion "${suggestion.nameEn}" has been approved!`;
    } else if (action === 'deny') {
      result = await prisma.$transaction(async (tx) => {
        // Update suggestion status
        const updated = await tx.tagSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: 'DENIED',
            moderatedById: moderatorId,
            moderatedAt: new Date(),
            moderatorNotes,
          },
        });

        // Decrement user's pending count
        await tx.user.update({
          where: { id: suggestion.suggestedById },
          data: { pendingSuggestionCount: { decrement: 1 } },
        });

        // Create notification
        await tx.notification.create({
          data: {
            type: 'TAG_SUGGESTION_DENIED',
            title: 'Tag Suggestion Denied',
            message: `Your suggestion "${suggestion.nameEn}" was not approved. ${moderatorNotes ? `Reason: ${moderatorNotes}` : ''}`,
            userId: suggestion.suggestedById,
          },
        });

        return { suggestion: updated };
      });

      notificationType = 'TAG_SUGGESTION_DENIED';
      notificationMessage = `Your suggestion "${suggestion.nameEn}" was denied.`;
    } else if (action === 'merge') {
      if (!mergedIntoTagId) {
        return NextResponse.json(
          { error: 'mergedIntoTagId is required for merge action' },
          { status: 400 }
        );
      }

      // Verify the tag exists
      const existingTag = await prisma.tag.findUnique({
        where: { id: mergedIntoTagId },
      });

      if (!existingTag) {
        return NextResponse.json({ error: 'Target tag not found' }, { status: 404 });
      }

      result = await prisma.$transaction(async (tx) => {
        // Update suggestion status
        const updated = await tx.tagSuggestion.update({
          where: { id: suggestionId },
          data: {
            status: 'MERGED',
            mergedIntoTagId,
            moderatedById: moderatorId,
            moderatedAt: new Date(),
            moderatorNotes,
          },
        });

        // Decrement user's pending count
        await tx.user.update({
          where: { id: suggestion.suggestedById },
          data: { pendingSuggestionCount: { decrement: 1 } },
        });

        // Create notification
        await tx.notification.create({
          data: {
            type: 'TAG_SUGGESTION_MERGED',
            title: 'Tag Suggestion Merged',
            message: `Your suggestion "${suggestion.nameEn}" was merged with existing tag "${existingTag.name}".`,
            userId: suggestion.suggestedById,
          },
        });

        return { suggestion: updated, mergedInto: existingTag };
      });

      notificationType = 'TAG_SUGGESTION_MERGED';
      notificationMessage = `Your suggestion was merged with "${existingTag.name}".`;
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to process tag suggestion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: 'Failed to process tag suggestion', details: errorMessage },
      { status: 500 }
    );
  }
}
