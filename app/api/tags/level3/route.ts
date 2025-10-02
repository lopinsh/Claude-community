import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags/level3 - Get Level 3 categories for selected Level 2 categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level2Param = searchParams.get('level2')

    if (!level2Param) {
      return NextResponse.json({ tags: [] })
    }

    const level2Ids = level2Param.split(',')

    // Find Level 3 tags that are children of the selected Level 2 tags
    const level3Tags = await prisma.tag.findMany({
      where: {
        level: 3,
        parentId: { in: level2Ids },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        parent: {
          select: {
            name: true,
            parent: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      tags: level3Tags
    })

  } catch (error) {
    console.error('Level 3 tags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Level 3 categories' },
      { status: 500 }
    )
  }
}