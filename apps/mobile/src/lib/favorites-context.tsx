import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type FavoritesContextValue = {
  favoriteIds: Set<string>;
  isFavorite: (vehicleId: string) => boolean;
  toggleFavorite: (vehicleId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((vehicleId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  }, []);

  const isFavorite = useCallback((vehicleId: string) => favoriteIds.has(vehicleId), [favoriteIds]);

  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite }), [favoriteIds, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
