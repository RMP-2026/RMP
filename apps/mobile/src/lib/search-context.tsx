import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_FILTERS, SearchFilters } from "../types/rmp";

type SearchState = {
  location: string;
  fromLabel: string;
  untilLabel: string;
  filters: SearchFilters;
  recentSearches: string[];
};

type SearchContextValue = SearchState & {
  setLocation: (location: string) => void;
  setFromLabel: (label: string) => void;
  setUntilLabel: (label: string) => void;
  setFilters: (filters: SearchFilters) => void;
  addRecentSearch: (location: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState("Miami, FL");
  const [fromLabel, setFromLabel] = useState("Aug 10, 10 AM");
  const [untilLabel, setUntilLabel] = useState("Aug 13, 10 AM");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [recentSearches, setRecentSearches] = useState<string[]>(["Miami, FL", "Los Angeles, CA"]);

  const setLocation = (next: string) => setLocationState(next);
  const addRecentSearch = (next: string) =>
    setRecentSearches((prev) => [next, ...prev.filter((item) => item !== next)].slice(0, 5));

  const value = useMemo(
    () => ({
      location,
      fromLabel,
      untilLabel,
      filters,
      recentSearches,
      setLocation,
      setFromLabel,
      setUntilLabel,
      setFilters,
      addRecentSearch,
    }),
    [location, fromLabel, untilLabel, filters, recentSearches]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}
