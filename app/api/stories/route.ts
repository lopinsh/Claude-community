import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List published story articles (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where: { published: true },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.newsArticle.count({ where: { published: true } }),
    ]);

    return NextResponse.json({ articles, total });
  } catch (error) {
    console.error('Failed to fetch story articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story articles' },
      { status: 500 }
    );
  }
}
