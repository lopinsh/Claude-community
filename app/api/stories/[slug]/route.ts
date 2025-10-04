import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get single published story article by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.newsArticle.findUnique({
      where: {
        slug: params.slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only return published articles to non-moderators
    if (!article.published) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to fetch story article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story article' },
      { status: 500 }
    );
  }
}
