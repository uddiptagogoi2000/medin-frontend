"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PostCard from "../../feed/_components/PostCard";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";

interface Props {
  clerkId: string;
  limit?: number;
  showViewAll?: boolean;
  showContainer?: boolean;
  variant?: "list" | "slider";
}

interface ProfilePost {
  id: number;
  title?: string | null;
  content?: any;
  preview_text?: string | null;
  first_image?: string | null;
  created_at: string;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
  is_anonymous?: boolean;
  author_clerk_id?: string;
  author_name?: string | null;
  author_avatar?: string | null;
  author_specialization?: string | null;
  author_hospital?: string | null;
  is_liked_by_me?: boolean;
  is_reposted_by_me?: boolean;
  is_following_author?: boolean;
  visibility?: string;
  tags?: string[];
}

export default function RecentPostsPanel({
  clerkId,
  limit,
  showViewAll = false,
  showContainer = true,
  variant = "list",
}: Props) {
  const { getToken } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [swiperRef, setSwiperRef] = useState<any>(null);

  useEffect(() => {
    if (!clerkId) return;
    fetchPosts();
  }, [clerkId]);

  async function fetchPosts() {
    try {
      setLoading(true);

      const token = await getToken({ template: "backend" });

      const res = await fetch(
        `http://localhost:8000/profile/${clerkId}/activity/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Recent posts fetch failed:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  const safeLimit = limit ?? (variant === "slider" ? 8 : undefined);
  const visiblePosts =
    typeof safeLimit === "number" ? posts.slice(0, safeLimit) : posts;

  const Wrapper = showContainer ? "div" : "section";
  const wrapperClass = showContainer
    ? "rounded-2xl bg-white shadow-sm p-5"
    : "space-y-4";

  return (
    <Wrapper className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Recent Posts</h3>

        {variant === "slider" && visiblePosts.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-default-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition"
              onClick={() => swiperRef?.slidePrev()}
            >
              <ChevronLeft size={16} className="mx-auto" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full border border-default-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition"
              onClick={() => swiperRef?.slideNext()}
            >
              <ChevronRight size={16} className="mx-auto" />
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(variant === "slider" ? 3 : (safeLimit ?? 2))].map(
            (_, i) => (
              <PostCardSkeleton key={i} />
            ),
          )}
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-xl bg-default-50 px-4 py-6 text-center text-sm text-gray-500">
          No posts yet.
        </div>
      ) : variant === "slider" ? (
        <>
          <Swiper
            className="recent-posts-swiper"
            onSwiper={setSwiperRef}
            spaceBetween={16}
            slidesPerView={1.4}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              900: { slidesPerView: 3.2 },
              1200: { slidesPerView: 3.35 },
            }}
          >
            {visiblePosts.map((post) => (
              <SwiperSlide key={post.id} className="h-auto !flex">
                <PostCard
                  className="h-full"
                  compact
                  contentClickNavigate
                  moreBehavior="navigate"
                  commentBehavior="navigate"
                  showFollowButton={false}
                  post={{
                    id: String(post.id),
                    title: post.title ?? "",
                    author: {
                      name: post.is_anonymous
                        ? "Anonymous Doctor"
                        : post.author_name || "Doctor",
                      avatar: post.is_anonymous
                        ? ""
                        : (post.author_avatar ?? ""),
                      title: post.author_specialization
                        ? `${post.author_specialization} · ${post.author_hospital || ""}`.trim()
                        : post.author_hospital || undefined,
                      clerk_id: post.author_clerk_id,
                    },
                    content: post.content ?? {},
                    previewText: post.preview_text ?? "",
                    firstImage: post.first_image ?? null,
                    createdAt: post.created_at,
                    likeCount: post.like_count ?? 0,
                    commentCount: post.comment_count ?? 0,
                    repostCount: post.repost_count ?? 0,
                    isLiked: post.is_liked_by_me ?? false,
                    isReposted: post.is_reposted_by_me ?? false,
                    isFollowingAuthor: post.is_following_author ?? false,
                    isAnonymous: post.is_anonymous ?? false,
                    visibility: post.visibility,
                    tags: post.tags ?? [],
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {showViewAll && (
            <button
              onClick={() => router.push(`/u/${clerkId}/posts`)}
              className="mt-3 block w-full rounded-lg border border-default-200 px-4 py-2 text-center text-sm font-semibold text-primary hover:bg-default-50"
            >
              View all
            </button>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              contentClickNavigate
              moreBehavior="navigate"
              commentBehavior="navigate"
              showFollowButton={false}
              post={{
                id: String(post.id),
                title: post.title ?? "",
                author: {
                  name: post.is_anonymous
                    ? "Anonymous Doctor"
                    : post.author_name || "Doctor",
                  avatar: post.is_anonymous ? "" : (post.author_avatar ?? ""),
                  title: post.author_specialization
                    ? `${post.author_specialization} · ${post.author_hospital || ""}`.trim()
                    : post.author_hospital || undefined,
                  clerk_id: post.author_clerk_id,
                },
                content: post.content ?? {},
                previewText: post.preview_text ?? "",
                firstImage: post.first_image ?? null,
                createdAt: post.created_at,
                likeCount: post.like_count ?? 0,
                commentCount: post.comment_count ?? 0,
                repostCount: post.repost_count ?? 0,
                isLiked: post.is_liked_by_me ?? false,
                isReposted: post.is_reposted_by_me ?? false,
                isFollowingAuthor: post.is_following_author ?? false,
                isAnonymous: post.is_anonymous ?? false,
                visibility: post.visibility,
                tags: post.tags ?? [],
              }}
            />
          ))}
        </div>
      )}
    </Wrapper>
  );
}
