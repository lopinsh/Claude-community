import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireModerator } from '@/lib/authorization';

// GET - Dashboard statistics (moderator/admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalGroups,
      pendingGroups,
      pendingTagSuggestions,
      totalNewsArticles,
      publishedNews,
      totalPages,
      publishedPages,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.group.count({ where: { moderationStatus: 'PENDING' } }),
      prisma.tagSuggestion.count({ where: { status: 'PENDING' } }),
      prisma.newsArticle.count(),
      prisma.newsArticle.count({ where: { published: true } }),
      prisma.page.count(),
      prisma.page.count({ where: { published: true } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalGroups,
      pendingGroups,
      pendingTagSuggestions,
      totalNewsArticles,
      publishedNews,
      totalPages,
      publishedPages,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
