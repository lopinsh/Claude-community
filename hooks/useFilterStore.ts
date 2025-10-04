import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedLevel2: string[];
  selectedLevel3: string[];
  selectedLocation: string | null;
}

interface FilterStore extends FilterState {
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedLevel2: (level2: string[]) => void;
  setSelectedLevel3: (level3: string[]) => void;
  setSelectedLocation: (location: string | null) => void;
  clearAllFilters: () => void;
}

const initialState: FilterState = {
  searchQuery: '',
  selectedCategories: [],
  selectedLevel2: [],
  selectedLevel3: [],
  selectedLocation: null,
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      setSelectedLevel2: (level2) => set({ selectedLevel2: level2 }),
      setSelectedLevel3: (level3) => set({ selectedLevel3: level3 }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      clearAllFilters: () => set(initialState),
    }),
    {
      name: 'filter-storage', // localStorage key
    }
  )
);
