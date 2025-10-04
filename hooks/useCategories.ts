'use client';

import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  colorKey: string | null;
  iconName: string | null;
  description: string | null;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch L1 categories from database
 * Single source of truth - no hardcoded categories
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Helper to normalize category name to slug
 * e.g., "Community & Society" -> "community-society"
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
 * Get category color by name (searches in categories array)
 */
export const getCategoryColor = (
  categoryName: string,
  categories: Category[]
): string => {
  const category = categories.find(
    (c) =>
      c.name.toLowerCase() === categoryName.toLowerCase() ||
      normalizeCategoryName(c.name) === normalizeCategoryName(categoryName)
  );
  return category?.colorKey || 'gray';
};
