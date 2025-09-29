// scripts/seed-tags.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTags() {
  console.log('Seeding initial tags...')

  // Check if tags already exist
  const existingTags = await prisma.tag.count()
  if (existingTags > 0) {
    console.log(`Found ${existingTags} existing tags. Skipping seed...`)
    return
  }

  // Level 1 - Broad categories
  const cultural = await prisma.tag.upsert({
    where: { name: 'cultural' },
    update: {},
    create: { name: 'cultural', level: 1 }
  })

  const physical = await prisma.tag.upsert({
    where: { name: 'physical' },
    update: {},
    create: { name: 'physical', level: 1 }
  })

  const learning = await prisma.tag.upsert({
    where: { name: 'learning' },
    update: {},
    create: { name: 'learning', level: 1 }
  })

  const social = await prisma.tag.upsert({
    where: { name: 'social' },
    update: {},
    create: { name: 'social', level: 1 }
  })

  // Level 2 - Specific activities (with parents)
  await prisma.tag.upsert({
    where: { name: 'choir' },
    update: {},
    create: { name: 'choir', parentId: cultural.id, level: 2 }
  })

  await prisma.tag.upsert({
    where: { name: 'folk-dance' },
    update: {},
    create: { name: 'folk-dance', parentId: cultural.id, level: 2 }
  })

  await prisma.tag.upsert({
    where: { name: 'workout' },
    update: {},
    create: { name: 'workout', parentId: physical.id, level: 2 }
  })

  await prisma.tag.upsert({
    where: { name: 'language-exchange' },
    update: {},
    create: { name: 'language-exchange', parentId: learning.id, level: 2 }
  })

  // Level 3 - Attributes (no parents for now, can be used with any activity)
  await prisma.tag.upsert({
    where: { name: 'beginner-friendly' },
    update: {},
    create: { name: 'beginner-friendly', level: 3 }
  })

  await prisma.tag.upsert({
    where: { name: 'weekly' },
    update: {},
    create: { name: 'weekly', level: 3 }
  })

  await prisma.tag.upsert({
    where: { name: 'evening' },
    update: {},
    create: { name: 'evening', level: 3 }
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