"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/utils/api";

const LIMIT = 2;

export function useFeedPosts() {
  const { getToken } = useAuth();

  return useInfiniteQuery({
    queryKey: ["feed"],

    queryFn: async ({ pageParam }) => {
      const token = await getToken({ template: "backend" });

      const res = await fetch(
        apiUrl(`/posts?skip=${pageParam}&limit=${LIMIT}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch posts");

      return res.json();
    },

    initialPageParam: 0,  // React Query v5

    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < LIMIT) return undefined;
      return pages.length * LIMIT;
    },

    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
