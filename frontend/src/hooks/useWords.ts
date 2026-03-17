import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useState } from "react";

export function useWords(sort?: string, order?: string) {
  return useQuery({
    queryKey: ["words", sort, order],
    queryFn: () => api.getWords(undefined, sort, order),
  });
}

export function useSearchWords(query: string) {
  return useQuery({
    queryKey: ["words", "search", query],
    queryFn: () => api.searchWords(query),
    enabled: query.length > 0,
    placeholderData: (prev) => prev,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });
}

export function useRandomWord() {
  const [enabled, setEnabled] = useState(false);

  const query = useQuery({
    queryKey: ["words", "random", enabled],
    queryFn: () => api.getRandomWord(),
    enabled,
  });

  const fetchRandom = () => {
    setEnabled((v) => !v); // toggle to force refetch
  };

  return { ...query, fetchRandom };
}

export function useAddWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => api.addWord(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRepeatWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.repeatWord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useSetWordStudied() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, studied }: { id: number; studied: boolean }) =>
      api.setWordStudied(id, studied),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.deleteWord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
