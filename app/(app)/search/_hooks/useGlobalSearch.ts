"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/utils/api";

export interface SearchUser {
  clerk_id: string;
  name: string;
  avatar: string | null;
  doctor_id: string | null;
  specialization: string | null;
  hospital: string | null;
  city: string | null;
  state: string | null;
}

export interface SearchPost {
  id: number;
  title: string | null;
  preview_text: string | null;
  first_image: string | null;
  visibility: string;
  is_anonymous: boolean;
  author_clerk_id: string;
  author_name: string;
  author_avatar: string | null;
  created_at: string;
}

export interface GlobalSearchResponse {
  query: string;
  users: SearchUser[];
  posts: SearchPost[];
}

export function useGlobalSearch(keyword?: string, limit = 5) {
  const { getToken } = useAuth();
  const trimmedKeyword = (keyword ?? "").trim();

  return useQuery({
    queryKey: ["global-search", trimmedKeyword, limit],
    enabled: trimmedKeyword.length >= 2,
    queryFn: async (): Promise<GlobalSearchResponse> => {
      const token = await getToken({ template: "backend" });

      const params = new URLSearchParams({
        q: trimmedKeyword,
        limit: String(limit),
      });

      const response = await fetch(apiUrl(`/search/?${params}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      return response.json();
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
