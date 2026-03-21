"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export interface SuggestionsResponse {
  same_hospital: any[];
  same_specialization: any[];
}

export function useSuggestions() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["suggestions"],
    queryFn: async (): Promise<SuggestionsResponse> => {
      const token = await getToken({ template: "backend" });

      const res = await fetch(
        "http://localhost:8000/connections/suggestions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      return res.json();
    },

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}