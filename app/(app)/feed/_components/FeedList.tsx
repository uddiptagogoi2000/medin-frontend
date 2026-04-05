"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import PostCard from "./PostCard";
import { useFeedPosts } from "../_hooks/useFeedPosts";
import { useVirtualizer } from "@tanstack/react-virtual";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";

interface BackendPost {
  id: number;
  title: string;
  content: any;
  preview_text: string | null;
  first_image: string | null;
  visibility: string;
  is_anonymous: boolean;
  author_clerk_id: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  is_liked_by_me: boolean;
  is_reposted_by_me: boolean;
  is_following_author: boolean;
  tags?: string[];
  author_name: string;
  author_avatar: string | null;
  author_specialization: string | null;
  author_hospital: string | null;
}

export default function FeedList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeedPosts();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const posts = Array.from(
    new Map((data?.pages.flat() ?? []).map((p) => [p.id, p])).values(),
  );

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];

      if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <PostCard
          key={post.id}
          post={{
            id: String(post.id),
            title: post.title,
            author: {
              name: post.is_anonymous ? "Anonymous Doctor" : post.author_name,
              avatar: post.is_anonymous ? undefined : post.author_avatar,
              title: post.author_specialization
                ? `${post.author_specialization} · ${post.author_hospital}`
                : post.author_hospital || undefined,
              clerk_id: post.author_clerk_id,
            },
            content: post.content,
            previewText: post.preview_text ?? "",
            firstImage: post.first_image,
            createdAt: post.created_at,
            likeCount: post.like_count,
            commentCount: post.comment_count,
            repostCount: post.repost_count,
            isLiked: post.is_liked_by_me,
            isReposted: post.is_reposted_by_me,
            isFollowingAuthor: post.is_following_author,
            visibility: post.visibility,
            isAnonymous: post.is_anonymous,
            tags: post.tags ?? [],
          }}
        />
      ))}

      {/* Infinite loader */}
      <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && <span>Loading more...</span>}
      </div>
    </div>
  );
}
