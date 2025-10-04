/**
 * Dynamic Category Utilities
 *
 * Fetches category metadata from database instead of hardcoded constants.
 * This ensures UI stays in sync when categories change in the database.
 */

import { prisma } from './prisma';

export interface CategoryMetadata {
  id: string;
  name: string;
  colorKey: string;
  iconName: string;
  description: string | null;
  level: number;
}

/**
 * Get all L1 categories with metadata
 * @returns Array of L1 category metadata
 */
export async function getL1Categories(): Promise<CategoryMetadata[]> {
  const categories = await prisma.tag.findMany({
    where: { level: 1, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      colorKey: true,
      iconName: true,
      description: true,
      level: true,
    },
    orderBy: { name: 'asc' },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    colorKey: cat.colorKey || 'gray',
    iconName: cat.iconName || 'IconTag',
    description: cat.description,
    level: cat.level,
  }));
}

/**
 * Get category metadata by name
 * @param categoryName Name of the category
 * @returns Category metadata or null
 */
export async function getCategoryByName(categoryName: string): Promise<CategoryMetadata | null> {
  const category = await prisma.tag.findFirst({
    where: { name: categoryName, level: 1, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      colorKey: true,
      iconName: true,
      description: true,
      level: true,
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    colorKey: category.colorKey || 'gray',
    iconName: category.iconName || 'IconTag',
    description: category.description,
    level: category.level,
  };
}

/**
 * Get L1 category for a given L3 tag via primary mapping
 * @param tagId L3 tag ID
 * @returns L1 category metadata or null
 */
export async function getL1CategoryForTag(tagId: string): Promise<CategoryMetadata | null> {
  // Find the primary TagParent entry
  const tagParent = await prisma.tagParent.findFirst({
    where: { tagId, isPrimary: true },
    include: {
      parent: {
        include: {
          parentTagParents: {
            where: { isPrimary: true },
            include: {
              parent: true, // This is the L1
            },
          },
        },
      },
    },
  });

  if (!tagParent) return null;

  // Navigate to L1: tagParent.parent is L2, need to find its L1 parent
  const l2ParentEntry = tagParent.parent.parentTagParents[0];
  if (!l2ParentEntry) return null;

  const l1Tag = l2ParentEntry.parent;

  return {
    id: l1Tag.id,
    name: l1Tag.name,
    colorKey: l1Tag.colorKey || 'gray',
    iconName: l1Tag.iconName || 'IconTag',
    description: l1Tag.description,
    level: l1Tag.level,
  };
}

/**
 * Get all L1 categories for a tag (primary + secondary)
 * @param tagId L3 tag ID
 * @returns Array of L1 category metadata
 */
export async function getAllL1CategoriesForTag(tagId: string): Promise<CategoryMetadata[]> {
  const tagParents = await prisma.tagParent.findMany({
    where: { tagId },
    select: {
      l1Category: true,
      l1ColorKey: true,
      isPrimary: true,
    },
  });

  // Get unique L1 categories
  const uniqueL1 = new Map<string, { colorKey: string; isPrimary: boolean }>();
  tagParents.forEach((tp) => {
    if (!uniqueL1.has(tp.l1Category) || tp.isPrimary) {
      uniqueL1.set(tp.l1Category, {
        colorKey: tp.l1ColorKey,
        isPrimary: tp.isPrimary,
      });
    }
  });

  // Fetch full metadata for each unique L1
  const categories: CategoryMetadata[] = [];
  for (const [categoryName, { colorKey, isPrimary }] of uniqueL1.entries()) {
    const category = await getCategoryByName(categoryName);
    if (category) {
      categories.push(category);
    }
  }

  // Sort: primary first, then alphabetically
  return categories.sort((a, b) => {
    const aData = tagParents.find((tp) => tp.l1Category === a.name);
    const bData = tagParents.find((tp) => tp.l1Category === b.name);
    if (aData?.isPrimary && !bData?.isPrimary) return -1;
    if (!aData?.isPrimary && bData?.isPrimary) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get color key for a category name (backward compatibility)
 * @param categoryName Name of the category
 * @returns Mantine color key
 */
export async function getCategoryColor(categoryName: string): Promise<string> {
  const category = await getCategoryByName(categoryName);
  return category?.colorKey || 'gray';
}
