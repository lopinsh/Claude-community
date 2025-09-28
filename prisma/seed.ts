// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the type structure for the nested tag data
interface TagChild {
    level: number;
    children?: {
        [name: string]: TagChild;
    };
}

// Define the root type for the tag hierarchy
interface TagHierarchy {
    [name: string]: TagChild;
}

// Define a structured list of tags and their relationships
const tagData: TagHierarchy = {
  // === LEVEL 1: BROAD CATEGORIES ===
  'Arts & Culture': {
    level: 1,
    children: {
      'Visual Arts': {
        level: 2,
        children: {
          'Oil Painting': { level: 3 },
          'Sculpture': { level: 3 },
        }
      },
      'Performing Arts': {
        level: 2,
        children: {
          'Improv Comedy': { level: 3 },
          'Musical Theatre': { level: 3 },
        }
      },
      'Literature & Writing': {
        level: 2,
        children: {
          'Book Club': { level: 3 },
          'Poetry Slam': { level: 3 },
        }
      },
    }
  },
  'Physical Activities': {
    level: 1,
    children: {
      'Team Sports': {
        level: 2,
        children: {
          'Basketball': { level: 3 },
          'Volleyball': { level: 3 },
        }
      },
      'Mindful Movement': {
        level: 2,
        children: {
          'Yoga': { level: 3 },
          'Pilates': { level: 3 },
        }
      },
      // Example of multi-parenting: Folk Dance is L2, but linked to L1 Arts and L1 Physical
      'Folk Dance': {
        level: 2,
        children: {
          'Beginner-Friendly': { level: 3 },
          'Weekly': { level: 3 },
        }
      }
    }
  },
  'Technology & Gaming': {
    level: 1,
    children: {
      'Board Games': {
        level: 2,
        children: {
          'Strategy Games': { level: 3 },
          'Casual Games': { level: 3 },
        }
      },
      'Coding & Dev': {
        level: 2,
        children: {
          'Frontend Focus': { level: 3 },
          'Data Science': { level: 3 },
        }
      },
    }
  },
};

// === Core Seeding Logic ===
async function main() {
  console.log('Start seeding tag data...');

  // 1. Clear existing Tag data
  await prisma.tagRelation.deleteMany();
  await prisma.tag.deleteMany();
  console.log('Cleared existing tags and relations.');
  
  const tagCache: { [name: string]: { id: string, level: number } } = {};
  const relationsToCreate: Array<{ parentName: string, childName: string }> = [];

  // 2. Insert all Tags first (L1, L2, L3) and build the cache
  // l1Data is correctly inferred as TagChild type here
  for (const [l1Name, l1Data] of Object.entries(tagData)) {
    // Insert L1 Tag
    const l1Tag = await prisma.tag.create({
      data: { name: l1Name, level: l1Data.level }
    });
    tagCache[l1Name] = { id: l1Tag.id, level: l1Tag.level };
    console.log(`Created L${l1Data.level}: ${l1Name}`);

    // l2Data is correctly inferred as TagChild type here
    for (const [l2Name, l2Data] of Object.entries(l1Data.children || {})) {
      let l2Tag = await prisma.tag.findUnique({ where: { name: l2Name } });
      
      // Check if L2 already exists (for multi-parenting cases like Folk Dance)
      if (!l2Tag) {
        l2Tag = await prisma.tag.create({
          data: { name: l2Name, level: l2Data.level }
        });
        console.log(`Created L${l2Data.level}: ${l2Name}`);
      }
      tagCache[l2Name] = { id: l2Tag.id, level: l2Tag.level };

      // Queue L1 -> L2 relation
      relationsToCreate.push({ parentName: l1Name, childName: l2Name });

      // Insert L3 Tags
      // l3Data is now correctly inferred as TagChild type, fixing the 'unknown' error
      for (const [l3Name, l3Data] of Object.entries(l2Data.children || {})) {
        let l3Tag = await prisma.tag.findUnique({ where: { name: l3Name } });
        
        // Check if L3 already exists (unlikely but safe)
        if (!l3Tag) {
          l3Tag = await prisma.tag.create({
            data: { name: l3Name, level: l3Data.level }
          });
          console.log(`Created L${l3Data.level}: ${l3Name}`);
        }
        tagCache[l3Name] = { id: l3Tag.id, level: l3Tag.level };

        // Queue L2 -> L3 relation
        relationsToCreate.push({ parentName: l2Name, childName: l3Name });
      }
    }
  }

  // 3. Create all TagRelation entries using the cached IDs
  for (const { parentName, childName } of relationsToCreate) {
    if (tagCache[parentName] && tagCache[childName]) {
      await prisma.tagRelation.create({
        data: {
          parentId: tagCache[parentName].id,
          childId: tagCache[childName].id,
        }
      });
    }
  }

  console.log(`Finished creating ${Object.keys(tagCache).length} tags and ${relationsToCreate.length} relationships.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });