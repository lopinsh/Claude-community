import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying migration results...\n');

  // Check L1 categories
  const categories = await prisma.tag.findMany({
    where: { level: 1 },
    select: {
      name: true,
      colorKey: true,
      _count: { select: { groups: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log('📊 L1 Categories:');
  categories.forEach((c) => {
    console.log(`  - ${c.name} (${c.colorKey}) - ${c._count.groups} groups`);
  });

  // Check migrated groups
  const groupTags = await prisma.groupTag.findMany({
    where: {
      group: {
        title: {
          in: ['Centrs Neighborhood Initiative', 'Daugava River Cleanup Volunteers'],
        },
      },
    },
    include: {
      tag: { select: { name: true, level: true } },
      group: { select: { title: true } },
    },
  });

  console.log('\n📦 Migrated groups:');
  const grouped = groupTags.reduce((acc: any, gt) => {
    if (!acc[gt.group.title]) acc[gt.group.title] = [];
    acc[gt.group.title].push(`${gt.tag.name} (L${gt.tag.level})`);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([title, tags]) => {
    console.log(`  ${title}:`);
    (tags as string[]).forEach((tag) => console.log(`    - ${tag}`));
  });

  console.log('\n✅ Verification complete!');
}

main()
  .finally(() => prisma.$disconnect());
