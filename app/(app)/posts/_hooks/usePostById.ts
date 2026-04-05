"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { apiUrl } from "@/utils/api";

export function usePostById(postId?: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["post", postId],
    enabled: !!postId,
    queryFn: async () => {
      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl(`/posts/${postId}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
