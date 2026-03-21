"use client";

import { useSearchParams } from "next/navigation";
import PostCard from "@/app/(app)/feed/_components/PostCard";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import SearchUserItem from "../../_components/SearchUserItem";
import { useGlobalSearch } from "../../_hooks/useGlobalSearch";

export default function SearchResultsContentPage() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const type = searchParams.get("type") === "users" ? "users" : "posts";

  const { data, isLoading, isError } = useGlobalSearch(keyword, 10);

  const posts = data?.posts ?? [];
  const users = data?.users ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-4 space-y-4">
          <div className="rounded-2xl border border-[#cdebe7] bg-gradient-to-r from-white to-[#eef8f7] px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-[#24746d] font-semibold">Search Hub</p>
            <h1 className="text-3xl font-black text-gray-900 mt-1">
              {type === "posts" ? "Clinical Posts" : "Clinician Profiles"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Query: “{keyword || "-"}”</p>
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
          ) : type === "posts" ? (
            <>
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-default-200 bg-white p-4 text-sm text-gray-600">
                  No posts found.
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: String(post.id),
                      title: post.title ?? "",
                      author: {
                        name: post.author_name,
                        avatar: post.author_avatar ?? "",
                        clerk_id: post.author_clerk_id,
                      },
                      content: {},
                      previewText: post.preview_text ?? "",
                      firstImage: post.first_image,
                      createdAt: post.created_at,
                      isAnonymous: post.is_anonymous,
                      visibility: post.visibility,
                    }}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {users.length === 0 ? (
                <div className="rounded-2xl border border-default-200 bg-white p-4 text-sm text-gray-600">
                  No users found.
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <SearchUserItem key={user.clerk_id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          <div className="rounded-2xl border border-[#cdebe7] bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-800">Trending In Specialties</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl bg-[#eef8f7] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#1a6b64] font-semibold">Case Signal</p>
                <p className="font-semibold text-gray-800 mt-1">Valve repair protocol updates</p>
              </div>
              <div className="rounded-xl bg-[#fff4ed] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#b64d16] font-semibold">Debate</p>
                <p className="font-semibold text-gray-800 mt-1">Post-MI timing recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
