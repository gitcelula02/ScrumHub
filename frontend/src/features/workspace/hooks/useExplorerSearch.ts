/**
 * @hook useExplorerSearch
 * Feature hook for debounced project search.
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { explorerService } from "../services/explorerService";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import type { SearchResult } from "../types/explorerTypes";

export interface UseExplorerSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  error: Error | null;
}

export function useExplorerSearch(): UseExplorerSearchResult {
  const { user } = useAuthSession();
  const userId = user?.id ?? "0";
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useQuery<{ data: SearchResult[] }, Error>({
    queryKey: ["user", userId, "explorer", "search", debouncedQuery],
    queryFn: () => explorerService.searchProjects(userId, debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  return {
    query,
    setQuery,
    results: data?.data ?? [],
    isSearching: isLoading,
    error,
  };
}