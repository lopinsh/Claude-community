// Level 1 Category Colors - Coolors Palette
export const LEVEL1_CATEGORY_COLORS: Record<string, string> = {
  'skill-craft': 'categoryTeal',
  'movement-wellness': 'categoryGreen',
  'gathering-fun': 'categoryPeach',
  'performance-spectacle': 'categoryBlue',
  'community-society': 'categoryOrange',
  'practical-resource': 'categoryYellow'
}

// Level 1 Categories with display info and icons
export const LEVEL1_CATEGORIES = [
  {
    value: 'skill-craft',
    label: 'Skill & Craft',
    description: 'Learn & Make',
    color: 'categoryTeal',
    icon: 'IconBrain'
  },
  {
    value: 'movement-wellness',
    label: 'Movement & Wellness',
    description: 'Body & Health',
    color: 'categoryGreen',
    icon: 'IconHeart'
  },
  {
    value: 'gathering-fun',
    label: 'Gathering & Fun',
    description: 'Connect & Contribute',
    color: 'categoryPeach',
    icon: 'IconUsersGroup'
  },
  {
    value: 'performance-spectacle',
    label: 'Performance & Spectacle',
    description: 'Create & Share',
    color: 'categoryBlue',
    icon: 'IconTheater'
  },
  {
    value: 'community-society',
    label: 'Community & Society',
    description: 'Civic engagement & community service',
    color: 'categoryOrange',
    icon: 'IconBuilding'
  },
  {
    value: 'practical-resource',
    label: 'Practical & Resource',
    description: 'Fix & Exchange',
    color: 'categoryYellow',
    icon: 'IconTool'
  }
]

// Helper function to normalize category names for lookup
export const normalizeCategoryName = (name: string): string => {
  return name.toLowerCase()
    .replace(/\s*&\s*/g, '-') // Replace " & " with single dash
    .replace(/\s+/g, '-')     // Replace remaining spaces with dashes
    .replace(/[^\w-]/g, '')   // Remove non-alphanumeric chars except dashes
    .replace(/-+/g, '-')      // Replace multiple dashes with single dash
}

// Debug function to see what categories we're getting
export const debugCategoryMapping = (tags: Array<{ tag: { name: string; level: number } }>) => {
  const level1Categories = tags
    .filter(({ tag }) => tag.level === 1)
    .map(({ tag }) => ({
      original: tag.name,
      normalized: normalizeCategoryName(tag.name),
      hasColor: !!LEVEL1_CATEGORY_COLORS[normalizeCategoryName(tag.name)]
    }))

  console.log('Category mapping debug:', level1Categories)
  return level1Categories
}

// Helper function to get category color by name - returns Mantine color name
export const getCategoryColor = (categoryName: string): string => {
  const normalized = normalizeCategoryName(categoryName)
  return LEVEL1_CATEGORY_COLORS[normalized] || 'gray' // Default gray
}

// Border style return type
export interface BorderStyle {
  borderLeft: string
  gradientBorder: string | null
}

// Helper function to get border style based on categories
export const getBorderStyle = (tags: Array<{ tag: { name: string; level: number } }>): BorderStyle => {
  const level1Categories = tags
    .filter(({ tag }) => tag.level === 1)
    .map(({ tag }) => normalizeCategoryName(tag.name))

  const colors = level1Categories.map(cat => LEVEL1_CATEGORY_COLORS[cat]).filter(Boolean)

  if (colors.length === 0) {
    return {
      borderLeft: '4px solid rgb(156, 163, 175)',
      gradientBorder: null
    }
  }

  if (colors.length === 1) {
    return {
      borderLeft: `4px solid ${colors[0]}`,
      gradientBorder: null
    }
  }

  // Multiple categories - return gradient info for custom implementation
  return {
    borderLeft: 'none',
    gradientBorder: `linear-gradient(to bottom, ${colors.join(', ')})`
  }
}

// Get tag variant based on level (for visual hierarchy)
export const getTagVariant = (level: number): 'filled' | 'light' | 'outline' => {
  if (level === 1) return 'filled';
  if (level === 2) return 'light';
  return 'outline';
}

// Get tag size based on level - all use 'sm' to match description text
export const getTagSize = (level: number): 'xs' | 'sm' | 'md' => {
  // Use 'sm' for all levels to match card description text size
  return 'sm';
}

// Get parent Level 1 color for any tag (works with nested parent structure)
export const getTagParentColor = (
  tag: {
    id: string;
    name: string;
    level: number;
    parentId?: string | null;
    parent?: any; // Nested parent structure
  },
  allTags?: Array<{ tag: any }>
): string => {
  // If already Level 1, return its own color
  if (tag.level === 1) {
    return getCategoryColor(tag.name);
  }

  // If we have nested parent structure (from API), use it
  if (tag.parent) {
    let current = tag.parent;
    while (current) {
      if (current.level === 1) {
        return getCategoryColor(current.name);
      }
      current = current.parent;
    }
  }

  // Fallback: try to find in allTags array (legacy support)
  if (allTags && tag.parentId) {
    const findLevel1Parent = (currentTag: any): string => {
      if (currentTag.level === 1) {
        return getCategoryColor(currentTag.name);
      }

      if (!currentTag.parentId) {
        return 'categoryBlue';
      }

      const parent = allTags.find(({ tag: t }) => t.id === currentTag.parentId);
      if (!parent) {
        return 'categoryBlue';
      }

      return findLevel1Parent(parent.tag);
    };

    return findLevel1Parent(tag);
  }

  // Final fallback
  return 'categoryBlue';
}

// Get card border style with support for gradients
export const getCardBorderStyle = (
  tags: Array<{ tag: { id: string; name: string; level: number; parentId?: string | null } }>,
  theme: any // MantineTheme type
): {
  borderLeft?: string;
  gradientColors?: string[];
  hasGradient: boolean;
} => {
  if (tags.length === 0) {
    return {
      borderLeft: `4px solid ${theme.colors.gray[5]}`,
      hasGradient: false
    };
  }

  // Get unique Level 1 colors by tracing each tag back to its root
  const uniqueColors = new Set<string>();

  tags.forEach(({ tag }) => {
    const colorName = getTagParentColor(tag, tags);
    uniqueColors.add(colorName);
  });

  const colorArray = Array.from(uniqueColors);

  // No valid colors found
  if (colorArray.length === 0) {
    return {
      borderLeft: `4px solid ${theme.colors.gray[5]}`,
      hasGradient: false
    };
  }

  // Single color
  if (colorArray.length === 1) {
    return {
      borderLeft: `4px solid ${theme.colors[colorArray[0]][5]}`,
      hasGradient: false
    };
  }

  // Multiple colors - create gradient
  const gradientColors = colorArray.map(colorName => theme.colors[colorName][5]);

  return {
    gradientColors,
    hasGradient: true
  };
}