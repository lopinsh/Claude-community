// Utility functions for handling activity tags and related constants

export const LATVIAN_CITIES = [
  { value: 'riga', label: 'Rīga' },
  { value: 'daugavpils', label: 'Daugavpils' },
  { value: 'liepaja', label: 'Liepāja' },
  { value: 'jelgava', label: 'Jelgava' },
  { value: 'jurmala', label: 'Jūrmala' },
  { value: 'ventspils', label: 'Ventspils' },
  { value: 'rezekne', label: 'Rēzekne' },
  { value: 'valmiera', label: 'Valmiera' },
  { value: 'jekabpils', label: 'Jēkabpils' },
  { value: 'ogre', label: 'Ogre' },
  { value: 'other', label: 'Other' },
];

/**
 * Get badge color for different tag levels based on tag name and level
 */
export const getTagColor = (tagName: string, level: number): string => {
  const name = tagName.toLowerCase();

  if (level === 1) {
    if (name.includes('physical')) return 'green';
    if (name.includes('cultural')) return 'violet';
    if (name.includes('learning')) return 'blue';
    if (name.includes('social')) return 'yellow';
    return 'gray';
  } else if (level === 2) {
    return 'cyan';
  } else {
    return 'orange';
  }
};

/**
 * Get category color for level 1 tags specifically (for ActivityCard compatibility)
 */
export const getCategoryColor = (tags: Array<{ tag: { name: string; level: number } }>): string => {
  const level1Tag = tags.find(({ tag }) => tag.level === 1);
  if (!level1Tag) return 'gray';

  return getTagColor(level1Tag.tag.name, 1);
};

/**
 * Get badge variant based on tag level
 */
export const getTagVariant = (level: number): 'filled' | 'light' | 'outline' => {
  switch (level) {
    case 1:
      return 'filled';
    case 2:
      return 'light';
    case 3:
      return 'outline';
    default:
      return 'outline';
  }
};

/**
 * Get badge size based on tag level
 */
export const getTagSize = (level: number): 'xs' | 'sm' | 'md' => {
  switch (level) {
    case 1:
      return 'sm';
    case 2:
      return 'sm';
    case 3:
      return 'xs';
    default:
      return 'xs';
  }
};

/**
 * Organize tags by level for display
 */
export const organizeTagsByLevel = (tags: Array<{ tag: { id: string; name: string; level: number } }>) => {
  return {
    level1: tags.filter(({ tag }) => tag.level === 1),
    level2: tags.filter(({ tag }) => tag.level === 2),
    level3: tags.filter(({ tag }) => tag.level === 3),
  };
};