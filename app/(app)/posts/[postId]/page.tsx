"use client";

import { useParams } from "next/navigation";
import { useMyProfile } from "@/app/hooks/queries/useMyProfile";
import UserSummaryCard from "@/components/user/UserSummaryCard";
import UserSummaryCardSkeleton from "@/components/skeletons/UserSummaryCardSkeleton";
import PostCard from "@/app/(app)/feed/_components/PostCard";
import PostCardSkeleton from "@/components/skeletons/PostCardSkeleton";
import { usePostById } from "../_hooks/usePostById";

export default function PostDetailsPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId;

  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const { data: post, isLoading: isPostLoading, isError } = usePostById(postId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-1 space-y-4">
          {isProfileLoading ? (
            <UserSummaryCardSkeleton />
          ) : profile ? (
            <UserSummaryCard
              clerkId={profile.identity.clerk_id}
              name={profile.identity.name}
              avatar={profile.identity.avatar}
              specialization={profile.basic.specialization}
              hospital={profile.basic.hospital}
            />
          ) : null}
        </div>

        <div className="col-span-3 space-y-6">
          {isPostLoading ? (
            <PostCardSkeleton />
          ) : isError || !post ? (
            <div className="rounded-xl border border-default-200 bg-white p-6 text-sm text-gray-600">
              Post not found or unavailable.
            </div>
          ) : (
            <PostCard
              initialShowComments
              post={{
                id: String(post.id),
                title: post.title,
                author: {
                  name: post.is_anonymous
                    ? "Anonymous Doctor"
                    : post.author_name,
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
                repostCount: post.repost_count ?? 0,
                isLiked: post.is_liked_by_me,
                isReposted: post.is_reposted_by_me ?? false,
                isFollowingAuthor: post.is_following_author,
                visibility: post.visibility,
                isAnonymous: post.is_anonymous,
                tags: post.tags ?? [],
              }}
            />
          )}
        </div>

        <div className="col-span-2 space-y-4">
          {/* Future: SuggestedDoctors / Trending */}
        </div>
      </div>
    </div>
  );
}
