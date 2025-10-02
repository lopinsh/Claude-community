import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireModerator } from '@/lib/authorization';

// GET - List all news articles (moderator/admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const articles = await prisma.newsArticle.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { published: 'desc' },
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Failed to fetch news articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

// POST - Create new news article (moderator/admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, featuredImage, published } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { slug },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 400 }
      );
    }

    // Create article
    const article = await prisma.newsArticle.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Failed to create news article:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
