/**
 * Fuzzy Matching Utilities
 *
 * Provides fuzzy string matching for tag search using Levenshtein distance
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns Distance (lower = more similar)
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score (0-1, where 1 is perfect match)
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score
 */
export function similarityScore(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Check if query matches target with fuzzy matching
 * @param query Search query
 * @param target Target string to match against
 * @param threshold Similarity threshold (0-1, default 0.6)
 * @returns True if match, false otherwise
 */
export function fuzzyMatch(
  query: string,
  target: string,
  threshold: number = 0.6
): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  // Exact match
  if (normalizedTarget === normalizedQuery) {
    return true;
  }

  // Contains match
  if (normalizedTarget.includes(normalizedQuery)) {
    return true;
  }

  // Fuzzy match
  const score = similarityScore(normalizedQuery, normalizedTarget);
  return score >= threshold;
}

/**
 * Rank items by relevance to query
 * @param query Search query
 * @param items Items to rank
 * @param getName Function to extract name from item
 * @returns Sorted items by relevance (most relevant first)
 */
export function rankByRelevance<T>(
  query: string,
  items: T[],
  getName: (item: T) => string
): T[] {
  const normalizedQuery = query.toLowerCase().trim();

  return items
    .map((item) => {
      const name = getName(item);
      const normalizedName = name.toLowerCase().trim();

      let score = 0;

      // Exact match - highest priority
      if (normalizedName === normalizedQuery) {
        score = 1000;
      }
      // Starts with query - high priority
      else if (normalizedName.startsWith(normalizedQuery)) {
        score = 500;
      }
      // Contains query - medium priority
      else if (normalizedName.includes(normalizedQuery)) {
        score = 250;
      }
      // Fuzzy match - lower priority
      else {
        const similarity = similarityScore(normalizedQuery, normalizedName);
        score = similarity * 100;
      }

      return { item, score };
    })
    .filter(({ score }) => score > 60) // Only return reasonably relevant matches
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .map(({ item }) => item);
}
