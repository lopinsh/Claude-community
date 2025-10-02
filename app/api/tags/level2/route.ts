import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags/level2 - Get Level 2 categories for selected Level 1 categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level1Param = searchParams.get('level1')

    if (!level1Param) {
      return NextResponse.json({ tags: [] })
    }

    const level1Categories = level1Param.split(',')

    // Find Level 1 tags to get their IDs
    const level1Tags = await prisma.tag.findMany({
      where: {
        level: 1,
        name: { in: level1Categories.map(cat =>
          cat.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ').replace('Craft', '& Craft').replace('Wellness', '& Wellness').replace('Fun', '& Fun').replace('Spectacle', '& Spectacle').replace('Governance', '& Governance').replace('Resource', '& Resource')
        )},
        status: 'ACTIVE'
      },
      select: { id: true, name: true }
    })

    if (level1Tags.length === 0) {
      return NextResponse.json({ tags: [] })
    }

    // Find Level 2 tags that are children of the selected Level 1 tags
    const level2Tags = await prisma.tag.findMany({
      where: {
        level: 2,
        parentId: { in: level1Tags.map(tag => tag.id) },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        parent: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      tags: level2Tags,
      level1Tags: level1Tags
    })

  } catch (error) {
    console.error('Level 2 tags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Level 2 categories' },
      { status: 500 }
    )
  }
}