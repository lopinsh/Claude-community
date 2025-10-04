/**
 * Migration Script: Civic & Governance → Community & Society
 *
 * This script migrates groups and tags from the old "Civic & Governance"
 * category to the new "Community & Society" category.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Old category IDs
const OLD_L1_ID = 'cmg93uzkz000f7wx2rjyppgcm'; // Civic & Governance
const OLD_L2_VOLUNTEER_ID = 'cmg93uznt001g7wx2ui2s3cgq'; // Volunteer & Charity
const OLD_L2_ORGANIZING_ID = 'cmg93uzno001e7wx2b4rx6dke'; // Community Organizing
const OLD_L2_ADVOCACY_ID = 'cmg93uzny001i7wx2uwazoyta'; // Advocacy & Activism

// New category IDs
const NEW_L1_ID = 'cmgaha0cf000413y6y1jzh55r'; // Community & Society
const NEW_L2_LOCAL_ACTION_ID = 'cmgaha0em002b13y6ax5ilg7e'; // Local Action & Service
const NEW_L2_CIVIC_ENGAGEMENT_ID = 'cmgaha0ej002713y68r3gkto2'; // Civic Engagement & Government

async function main() {
  console.log('🔄 Starting migration: Civic & Governance → Community & Society\n');

  // Step 1: Find all affected groups
  console.log('📋 Step 1: Finding affected groups...');
  const groupTags = await prisma.groupTag.findMany({
    where: {
      OR: [
        { tagId: OLD_L1_ID },
        { tagId: OLD_L2_VOLUNTEER_ID },
        { tagId: OLD_L2_ORGANIZING_ID },
        { tagId: OLD_L2_ADVOCACY_ID },
      ],
    },
    include: {
      group: { select: { id: true, title: true } },
      tag: { select: { id: true, name: true, level: true } },
    },
  });

  console.log(`  Found ${groupTags.length} tag associations to migrate\n`);

  // Step 2: Migrate GroupTag records
  console.log('🔄 Step 2: Migrating group tags...');

  for (const groupTag of groupTags) {
    let newTagId: string;

    // Map old tags to new tags
    if (groupTag.tagId === OLD_L1_ID) {
      newTagId = NEW_L1_ID;
      console.log(`  ✓ Migrating "${groupTag.group.title}": Civic & Governance → Community & Society`);
    } else if (groupTag.tagId === OLD_L2_VOLUNTEER_ID) {
      newTagId = NEW_L2_LOCAL_ACTION_ID;
      console.log(`  ✓ Migrating "${groupTag.group.title}": Volunteer & Charity → Local Action & Service`);
    } else if (groupTag.tagId === OLD_L2_ORGANIZING_ID) {
      newTagId = NEW_L2_LOCAL_ACTION_ID; // Could also use NEW_L2_CIVIC_ENGAGEMENT_ID
      console.log(`  ✓ Migrating "${groupTag.group.title}": Community Organizing → Local Action & Service`);
    } else {
      // OLD_L2_ADVOCACY_ID
      newTagId = NEW_L2_CIVIC_ENGAGEMENT_ID;
      console.log(`  ✓ Migrating "${groupTag.group.title}": Advocacy & Activism → Civic Engagement & Government`);
    }

    // Update the GroupTag record
    await prisma.groupTag.update({
      where: { id: groupTag.id },
      data: { tagId: newTagId },
    });
  }
  console.log('');

  // Step 3: Update L3 tag parents
  console.log('🔄 Step 3: Updating L3 tag parent relationships...');

  // Get all L3 tags under old L2 tags
  const l3Tags = await prisma.tag.findMany({
    where: {
      level: 3,
      parentId: {
        in: [OLD_L2_VOLUNTEER_ID, OLD_L2_ORGANIZING_ID, OLD_L2_ADVOCACY_ID],
      },
    },
  });

  console.log(`  Found ${l3Tags.length} L3 tags to update`);

  for (const l3Tag of l3Tags) {
    let newParentId: string;

    if (l3Tag.parentId === OLD_L2_VOLUNTEER_ID) {
      newParentId = NEW_L2_LOCAL_ACTION_ID;
    } else if (l3Tag.parentId === OLD_L2_ORGANIZING_ID) {
      newParentId = NEW_L2_LOCAL_ACTION_ID;
    } else {
      newParentId = NEW_L2_CIVIC_ENGAGEMENT_ID;
    }

    // Update legacy parentId
    await prisma.tag.update({
      where: { id: l3Tag.id },
      data: { parentId: newParentId },
    });

    // Update TagParent records if they exist
    await prisma.tagParent.updateMany({
      where: {
        tagId: l3Tag.id,
        parentId: l3Tag.parentId!,
      },
      data: {
        parentId: newParentId,
        l1Category: 'Community & Society',
        l1ColorKey: 'categoryOrange',
      },
    });

    console.log(`  ✓ Updated "${l3Tag.name}" parent`);
  }
  console.log('');

  // Step 4: Update L2 tag parents
  console.log('🔄 Step 4: Updating L2 tag parent relationships...');

  await prisma.tag.updateMany({
    where: {
      id: {
        in: [OLD_L2_VOLUNTEER_ID, OLD_L2_ORGANIZING_ID, OLD_L2_ADVOCACY_ID],
      },
    },
    data: {
      parentId: NEW_L1_ID,
    },
  });

  await prisma.tagParent.updateMany({
    where: {
      tagId: {
        in: [OLD_L2_VOLUNTEER_ID, OLD_L2_ORGANIZING_ID, OLD_L2_ADVOCACY_ID],
      },
      parentId: OLD_L1_ID,
    },
    data: {
      parentId: NEW_L1_ID,
      l1Category: 'Community & Society',
      l1ColorKey: 'categoryOrange',
    },
  });

  console.log('  ✓ Updated L2 tag parents\n');

  // Step 5: Delete old L2 tags (optional - keep for now to preserve history)
  console.log('🗑️  Step 5: Marking old tags for review...');
  console.log('  Note: Not deleting old L2 tags to preserve history.');
  console.log('  They can be deleted manually later if needed.\n');

  // Step 6: Delete old L1 tag "Civic & Governance"
  console.log('🗑️  Step 6: Deleting old L1 category "Civic & Governance"...');

  // First, check if it has any remaining relationships
  const remainingGroupTags = await prisma.groupTag.count({
    where: { tagId: OLD_L1_ID },
  });

  const remainingChildren = await prisma.tag.count({
    where: { parentId: OLD_L1_ID },
  });

  if (remainingGroupTags === 0 && remainingChildren === 0) {
    await prisma.tag.delete({
      where: { id: OLD_L1_ID },
    });
    console.log('  ✅ Deleted "Civic & Governance" category\n');
  } else {
    console.log(`  ⚠️  Cannot delete - still has ${remainingGroupTags} group associations and ${remainingChildren} children\n`);
  }

  // Step 7: Verify migration
  console.log('✅ Step 7: Verifying migration...');

  const l1Categories = await prisma.tag.findMany({
    where: { level: 1 },
    select: { id: true, name: true, colorKey: true },
    orderBy: { name: 'asc' },
  });

  console.log('\n📊 Current L1 Categories:');
  l1Categories.forEach((cat, index) => {
    const hasColor = cat.colorKey ? '✅' : '❌';
    console.log(`  ${index + 1}. ${cat.name} ${hasColor} (${cat.colorKey || 'no color'})`);
  });

  console.log(`\n🎉 Migration complete!`);
  console.log(`   Total L1 categories: ${l1Categories.length} (should be 6)`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
