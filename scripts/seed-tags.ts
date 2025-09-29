// scripts/seed-tags.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTags() {
  console.log('Seeding initial tags...')

  // Level 1 - Broad categories
  const cultural = await prisma.tag.create({
    data: { name: 'cultural', level: 1 }
  })

  const physical = await prisma.tag.create({
    data: { name: 'physical', level: 1 }
  })

  const learning = await prisma.tag.create({
    data: { name: 'learning', level: 1 }
  })

  const social = await prisma.tag.create({
    data: { name: 'social', level: 1 }
  })

  // Level 2 - Specific activities (with parents)
  await prisma.tag.create({
    data: { name: 'choir', parentId: cultural.id, level: 2 }
  })

  await prisma.tag.create({
    data: { name: 'folk-dance', parentId: cultural.id, level: 2 }
  })

  await prisma.tag.create({
    data: { name: 'workout', parentId: physical.id, level: 2 }
  })

  await prisma.tag.create({
    data: { name: 'language-exchange', parentId: learning.id, level: 2 }
  })

  await prisma.tag.create({
    data: { name: 'book-club', parentId: social.id, level: 2 }
  })

  // Level 3 - Attributes (no parents for now, can be used with any activity)
  await prisma.tag.create({
    data: { name: 'beginner-friendly', level: 3 }
  })

  await prisma.tag.create({
    data: { name: 'weekly', level: 3 }
  })

  await prisma.tag.create({
    data: { name: 'evening', level: 3 }
  })

  console.log('Seed tags created successfully!')
}

seedTags()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })