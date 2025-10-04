/**
 * Server-side tag utilities for API routes
 * This file contains functions for working with tags in the database
 */

import { prisma } from '@/lib/prisma';

/**
 * Normalize category name to slug format
 * e.g., "Skill & Craft" -> "skill-craft"
 * This matches the normalization function in hooks/useCategories.ts
 */
export const normalizeCategoryName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
};

/**
 * Convert normalized category names back to actual database names
 * Used by API routes to map frontend-normalized names to database names
 *
 * @param normalizedNames - Array of normalized category names (e.g., ["skill-craft", "movement-wellness"])
 * @returns Array of actual database category names (e.g., ["Skill & Craft", "Movement & Wellness"])
 */
export async function denormalizeCategoryNames(normalizedNames: string[]): Promise<string[]> {
  // Fetch all L1 categories from database
  const categories = await prisma.tag.findMany({
    where: {
      level: 1,
    },
    select: {
      name: true,
    },
  });

  // Create mapping: normalized -> actual
  const nameMap = new Map<string, string>();
  categories.forEach(cat => {
    const normalized = normalizeCategoryName(cat.name);
    nameMap.set(normalized, cat.name);
  });

  // Map normalized names to actual names
  const actualNames: string[] = [];
  normalizedNames.forEach(normalized => {
    const actual = nameMap.get(normalized);
    if (actual) {
      actualNames.push(actual);
    }
  });

  return actualNames;
}
