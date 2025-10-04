/**
 * Seed Enhanced Taxonomy from category-examples.json
 *
 * This script:
 * 1. Parses the comprehensive taxonomy from examples/category-examples.json
 * 2. Creates all L1, L2, and L3 tags
 * 3. Creates TagParent entries for primary and secondary mappings
 * 4. Stores L1 category and color metadata
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Color mapping from category names to Mantine color keys
const COLOR_MAPPING: Record<string, string> = {
  'Skill & Craft': 'categoryTeal',
  'Movement & Wellness': 'categoryGreen',
  'Gathering & Fun': 'categoryPeach',
  'Performance & Spectacle': 'categoryBlue',
  'Community & Society': 'categoryOrange',
  'Practical & Resource': 'categoryYellow',
};

// Description mapping for L1 categories
const DESCRIPTION_MAPPING: Record<string, string> = {
  'Skill & Craft': 'Learn skills, create things, and master crafts',
  'Movement & Wellness': 'Physical activities, sports, and health',
  'Gathering & Fun': 'Social events, games, and entertainment',
  'Performance & Spectacle': 'Arts, performances, and creative expression',
  'Community & Society': 'Civic engagement, causes, and community service',
  'Practical & Resource': 'Resources, support, and practical help',
};

interface SecondaryMapping {
  level2Name: string;
  level1Name: string;
}

interface Level3Topic {
  name: string;
  isPrimaryMapping: boolean;
  secondaryMappings: SecondaryMapping[];
}

interface Level2Domain {
  name: string;
  level3Topics: Level3Topic[];
}

interface Level1Category {
  name: string;
  colorHex: string;
  iconName: string;
  level2Domains: Level2Domain[];
}

async function main() {
  console.log('🌱 Starting enhanced taxonomy seeding...\n');

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), 'examples', 'category-examples.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const categories: Level1Category[] = JSON.parse(jsonData);

  console.log(`📚 Found ${categories.length} L1 categories in JSON\n`);

  // Track created tags by name for reference
  const tagsByName = new Map<string, { id: string; name: string; level: number }>();

  // Step 1: Create all L1 categories with metadata
  console.log('📍 Step 1: Creating L1 categories with metadata...');
  for (const category of categories) {
    const l1Tag = await prisma.tag.upsert({
      where: { name: category.name },
      update: {
        level: 1,
        colorKey: COLOR_MAPPING[category.name],
        iconName: category.iconName,
        description: DESCRIPTION_MAPPING[category.name],
      },
      create: {
        name: category.name,
        level: 1,
        group: 'VERTICAL',
        status: 'ACTIVE',
        colorKey: COLOR_MAPPING[category.name],
        iconName: category.iconName,
        description: DESCRIPTION_MAPPING[category.name],
      },
    });
    tagsByName.set(category.name, { id: l1Tag.id, name: l1Tag.name, level: 1 });
    console.log(`  ✅ ${category.name} (${DESCRIPTION_MAPPING[category.name]})`);
  }
  console.log('');

  // Step 2: Create all L2 domains
  console.log('📍 Step 2: Creating L2 domains...');
  for (const category of categories) {
    const l1Tag = tagsByName.get(category.name)!;

    for (const domain of category.level2Domains) {
      const l2Tag = await prisma.tag.upsert({
        where: { name: domain.name },
        update: { level: 2 },
        create: {
          name: domain.name,
          level: 2,
          group: 'VERTICAL',
          status: 'ACTIVE',
          parentId: l1Tag.id, // Set legacy parent for backward compat
        },
      });
      tagsByName.set(domain.name, { id: l2Tag.id, name: l2Tag.name, level: 2 });

      // Create TagParent entry (L2 → L1)
      await prisma.tagParent.upsert({
        where: {
          tagId_parentId: {
            tagId: l2Tag.id,
            parentId: l1Tag.id,
          },
        },
        update: {},
        create: {
          tagId: l2Tag.id,
          parentId: l1Tag.id,
          isPrimary: true,
          l1Category: category.name,
          l1ColorKey: COLOR_MAPPING[category.name],
        },
      });

      console.log(`  ✅ ${domain.name} (under ${category.name})`);
    }
  }
  console.log('');

  // Step 3: Create all L3 topics with primary and secondary mappings
  console.log('📍 Step 3: Creating L3 topics and mappings...');
  let totalTopics = 0;
  let totalPrimaryMappings = 0;
  let totalSecondaryMappings = 0;

  for (const category of categories) {
    for (const domain of category.level2Domains) {
      const l2Tag = tagsByName.get(domain.name)!;

      for (const topic of domain.level3Topics) {
        // Create L3 tag
        const l3Tag = await prisma.tag.upsert({
          where: { name: topic.name },
          update: { level: 3 },
          create: {
            name: topic.name,
            level: 3,
            group: 'VERTICAL',
            status: 'ACTIVE',
            parentId: l2Tag.id, // Set legacy parent for backward compat
          },
        });
        tagsByName.set(topic.name, { id: l3Tag.id, name: l3Tag.name, level: 3 });
        totalTopics++;

        // Create primary TagParent entry (L3 → L2)
        if (topic.isPrimaryMapping) {
          await prisma.tagParent.upsert({
            where: {
              tagId_parentId: {
                tagId: l3Tag.id,
                parentId: l2Tag.id,
              },
            },
            update: {},
            create: {
              tagId: l3Tag.id,
              parentId: l2Tag.id,
              isPrimary: true,
              l1Category: category.name,
              l1ColorKey: COLOR_MAPPING[category.name],
            },
          });
          totalPrimaryMappings++;
        }

        // Create secondary TagParent entries
        for (const secondaryMapping of topic.secondaryMappings) {
          const secondaryL2Tag = tagsByName.get(secondaryMapping.level2Name);

          if (!secondaryL2Tag) {
            console.warn(`  ⚠️  L2 tag not found: ${secondaryMapping.level2Name} (for ${topic.name})`);
            continue;
          }

          await prisma.tagParent.upsert({
            where: {
              tagId_parentId: {
                tagId: l3Tag.id,
                parentId: secondaryL2Tag.id,
              },
            },
            update: {},
            create: {
              tagId: l3Tag.id,
              parentId: secondaryL2Tag.id,
              isPrimary: false,
              l1Category: secondaryMapping.level1Name,
              l1ColorKey: COLOR_MAPPING[secondaryMapping.level1Name],
            },
          });
          totalSecondaryMappings++;

          console.log(`    🔗 ${topic.name} → ${secondaryMapping.level2Name} (secondary)`);
        }

        if (topic.secondaryMappings.length === 0) {
          console.log(`  ✅ ${topic.name}`);
        }
      }
    }
  }
  console.log('');

  // Summary statistics
  console.log('📊 Seeding Summary:');
  console.log(`  Total L1 categories: ${categories.length}`);
  console.log(`  Total L2 domains: ${Array.from(tagsByName.values()).filter(t => t.level === 2).length}`);
  console.log(`  Total L3 topics: ${totalTopics}`);
  console.log(`  Total primary mappings: ${totalPrimaryMappings}`);
  console.log(`  Total secondary mappings: ${totalSecondaryMappings}`);
  console.log('');

  // Identify cross-category topics (topics with secondary mappings)
  const crossCategoryTopics = [];
  for (const category of categories) {
    for (const domain of category.level2Domains) {
      for (const topic of domain.level3Topics) {
        if (topic.secondaryMappings.length > 0) {
          crossCategoryTopics.push({
            name: topic.name,
            primary: `${category.name} > ${domain.name}`,
            secondaryCount: topic.secondaryMappings.length,
          });
        }
      }
    }
  }

  console.log(`🔀 Cross-Category Topics (${crossCategoryTopics.length}):`);
  for (const topic of crossCategoryTopics) {
    console.log(`  ${topic.name}`);
    console.log(`    Primary: ${topic.primary}`);
    console.log(`    Secondary paths: ${topic.secondaryCount}`);
  }
  console.log('');

  console.log('✅ Enhanced taxonomy seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding taxonomy:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
