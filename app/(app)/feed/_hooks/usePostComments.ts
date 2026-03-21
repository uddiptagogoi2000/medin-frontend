"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

const COMMENTS_LIMIT = 5;

export function usePostComments(postId: string, enabled: boolean) {
  const { getToken } = useAuth();

  return useInfiniteQuery({
    queryKey: ["post-comments", postId],

    queryFn: async ({ pageParam = 0 }) => {
      const token = await getToken({ template: "backend" });

      const response = await fetch(
        `http://localhost:8000/posts/${postId}/comments?skip=${
          pageParam * COMMENTS_LIMIT
        }&limit=${COMMENTS_LIMIT}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();

      return {
        comments: data.comments,
        nextPage: data.has_more ? pageParam + 1 : undefined,
      };
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage) => lastPage.nextPage,

    enabled, // only run when comments opened
  });
}