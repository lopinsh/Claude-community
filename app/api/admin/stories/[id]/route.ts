import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireModerator } from '@/lib/authorization';

// GET - Get single news article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    const article = await prisma.newsArticle.findUnique({
      where: { id: params.id },
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

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to fetch news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}

// PATCH - Update news article
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

    const body = await request.json();
    const { title, slug, content, excerpt, featuredImage, published } = body;

    // Check if article exists
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id: params.id },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // If slug is being changed, check uniqueness
    if (slug && slug !== existingArticle.slug) {
      const slugExists = await prisma.newsArticle.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'An article with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update article
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt || null;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage || null;

    // Handle publishing/unpublishing
    if (published !== undefined) {
      updateData.published = published;

      // Set publishedAt when publishing for the first time
      if (published && !existingArticle.publishedAt) {
        updateData.publishedAt = new Date();
      }

      // Clear publishedAt when unpublishing
      if (!published) {
        updateData.publishedAt = null;
      }
    }

    const article = await prisma.newsArticle.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Failed to update news article:', error);
    return NextResponse.json(
      { error: 'Failed to update news article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const authCheck = requireModerator(session);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: 403 });
    }

    // Check if article exists
    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id: params.id },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Delete article
    await prisma.newsArticle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete news article:', error);
    return NextResponse.json(
      { error: 'Failed to delete news article' },
      { status: 500 }
    );
  }
}
