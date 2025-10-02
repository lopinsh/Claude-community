import { Badge } from '@mantine/core';
import { getTagVariant, getTagSize } from '@/utils/categoryColors';

interface TagBadgeProps {
  tag: {
    name: string;
    level: number;
  };
  parentColorName: string; // Mantine color name (e.g., 'categoryTeal')
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Reusable tag badge component with hierarchical color support.
 *
 * - Level 1: filled variant (bold, saturated)
 * - Level 2: light variant (desaturated background)
 * - Level 3: outline variant (border only, most subtle)
 *
 * Colors automatically adapt to light/dark mode via Mantine's Badge component.
 */
export default function TagBadge({ tag, parentColorName, size }: TagBadgeProps) {
  return (
    <Badge
      size={size || getTagSize(tag.level)}
      variant={getTagVariant(tag.level)}
      color={parentColorName}
    >
      {tag.name}
    </Badge>
  );
}