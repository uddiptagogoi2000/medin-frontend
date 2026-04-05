"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { useGlobalSearch } from "../../_hooks/useGlobalSearch";
import { Avatar } from "@heroui/avatar";
import { formatPostDate } from "@/utils/formatPostDate";

function SearchResultsAllPageInner() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const { data, isLoading, isError } = useGlobalSearch(keyword, 4);

  const posts = data?.posts ?? [];
  const users = data?.users ?? [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-8">
          <div className="rounded-2xl border border-[#cdebe7] bg-gradient-to-r from-white to-[#eef8f7] px-5 py-4">
            <h1 className="text-4xl font-black text-gray-900">
              Search results for <span className="text-[#0f7c73]">"{keyword || "..."}"</span>
            </h1>
            <p className="mt-1 text-sm text-gray-500">Curated across clinician profiles and case insights.</p>
          </div>

          {keyword.trim().length < 2 ? (
            <div className="rounded-2xl border border-default-200 bg-white p-6 text-sm text-gray-600">
              Enter at least 2 characters to search.
            </div>
          ) : isLoading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : isError ? (
            <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6 text-sm text-danger-700">
              Could not load search results.
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-2xl border border-[#cdebe7] bg-white">
                <div className="px-5 pt-5 pb-3 border-b border-default-200">
                  <h2 className="text-2xl font-bold text-gray-900">People</h2>
                </div>

                {users.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-gray-600">No users found for "{keyword}".</div>
                ) : (
                  <div>
                    {users.map((user, idx) => (
                      <div
                        key={user.clerk_id}
                        className={`px-5 py-4 ${idx !== users.length - 1 ? "border-b border-default-200" : ""}`}
                      >
                        <div className="flex items-start gap-4">
                          <Link href={`/u/${user.clerk_id}`} className="flex gap-3 min-w-0 w-full">
                            <Avatar
                              radius="full"
                              size="lg"
                              src={user.avatar ?? undefined}
                              name={user.name}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-lg truncate text-gray-900">{user.name}</p>
                              <p className="text-sm text-[#206a64] truncate font-medium">
                                {user.specialization || "Doctor"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {[user.city, user.state].filter(Boolean).join(", ") || "Location unavailable"}
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/search/results/content?keyword=${encodeURIComponent(keyword)}&type=users`}
                  className="block w-full border-t border-default-200 px-4 py-3 text-center text-sm font-semibold text-[#206a64] hover:bg-[#eef8f7]"
                >
                  View all matching clinicians
                </Link>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#cdebe7] bg-white">
                <div className="px-5 pt-5 pb-3 border-b border-default-200">
                  <h2 className="text-2xl font-bold text-gray-900">Posts</h2>
                </div>

                {posts.length === 0 ? (
                  <div className="px-5 py-4 text-sm text-gray-600">No posts found for "{keyword}".</div>
                ) : (
                  <div>
                    {posts.map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className={`block px-5 py-4 hover:bg-[#f8fbfb] ${
                          idx !== posts.length - 1 ? "border-b border-default-200" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <Avatar
                            radius="full"
                            size="md"
                            src={post.author_avatar ?? undefined}
                            name={post.author_name}
                          />
                          <div className="min-w-0 w-full">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-base truncate text-gray-900">{post.author_name}</p>
                              <p className="text-xs text-gray-500 shrink-0">{formatPostDate(post.created_at)}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
                              {post.title || "Untitled post"}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                              {post.preview_text || "No preview available"}
                            </p>
                            {post.first_image && (
                              <img
                                src={post.first_image}
                                alt="Post preview"
                                className="mt-3 h-28 w-full rounded-xl object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href={`/search/results/content?keyword=${encodeURIComponent(keyword)}&type=posts`}
                  className="block w-full border-t border-default-200 px-4 py-3 text-center text-sm font-semibold text-[#206a64] hover:bg-[#eef8f7]"
                >
                  Show all post results
                </Link>
              </section>
            </>
          )}
        </div>
    </div>
  );
}

export default function SearchResultsAllPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto space-y-8">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      }
    >
      <SearchResultsAllPageInner />
    </Suspense>
  );
}
