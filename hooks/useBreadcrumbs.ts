import { create } from 'zustand';

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbStore {
  customBreadcrumbs: BreadcrumbItem[] | null;
  setCustomBreadcrumbs: (breadcrumbs: BreadcrumbItem[] | null) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  customBreadcrumbs: null,
  setCustomBreadcrumbs: (breadcrumbs) => set({ customBreadcrumbs: breadcrumbs }),
}));

export const useBreadcrumbs = () => {
  const { setCustomBreadcrumbs } = useBreadcrumbStore();
  return setCustomBreadcrumbs;
};