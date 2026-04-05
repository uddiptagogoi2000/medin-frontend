"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Tabs, Tab } from "@heroui/tabs";
import PostCard from "../../feed/_components/PostCard";
import { apiUrl } from "@/utils/api";

interface Props {
  clerkId: string;
}

export default function RecentActivity({ clerkId }: Props) {
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [reposts, setReposts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingReposts, setLoadingReposts] = useState(false);

  useEffect(() => {
    if (clerkId) {
      fetchPosts();
      fetchReposts();
    }
  }, [clerkId]);

  async function fetchPosts() {
    try {
      setLoadingPosts(true);

      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl(`/profile/${clerkId}/activity/posts`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Activity fetch failed:", err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function fetchReposts() {
    try {
      setLoadingReposts(true);

      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl(`/profile/${clerkId}/activity/reposts`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch reposts");

      const data = await res.json();
      setReposts(data);
    } catch (err) {
      console.error("Repost activity fetch failed:", err);
      setReposts([]);
    } finally {
      setLoadingReposts(false);
    }
  }

  return (
    <div className="mt-6">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        variant="underlined"
        color="primary"
      >
        <Tab key="all" title="All" />
        <Tab key="posts" title="Posts" />
        <Tab key="reposts" title="Reposts" />
        <Tab key="comments" title="Comments" isDisabled />
        <Tab key="likes" title="Likes" isDisabled />
      </Tabs>

      <div className="mt-6 space-y-6">
        {(loadingPosts || loadingReposts) && (
          <div className="text-gray-500 text-sm">Loading activity...</div>
        )}

        {!loadingPosts && !loadingReposts && activeTab === "all" && (
          <>
            {posts.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-700">Posts</h4>
                {renderPosts(posts, "post")}
              </div>
            )}

            {reposts.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-700">Reposts</h4>
                {renderPosts(reposts, "repost")}
              </div>
            )}

            {posts.length === 0 && reposts.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No activity yet.
              </div>
            )}
          </>
        )}

        {!loadingPosts && activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              renderPosts(posts, "post")
            ) : (
              <div className="text-center text-gray-500 py-12">
                No post activity yet.
              </div>
            )}
          </>
        )}

        {!loadingReposts && activeTab === "reposts" && (
          <>
            {reposts.length > 0 ? (
              renderPosts(reposts, "repost")
            ) : (
              <div className="text-center text-gray-500 py-12">
                No repost activity yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  function renderPosts(activityPosts: any[], keyPrefix: string) {
    return activityPosts.map((post, index) => (
      <PostCard
        key={`${keyPrefix}-${post.id}-${index}`}
        post={{
          id: String(post.id),
          title: post.title ?? "",
          author: {
            name: post.is_anonymous
              ? "Anonymous Doctor"
              : (post.author_name ?? "Doctor"),
            avatar: post.is_anonymous ? "" : (post.author_avatar ?? ""),
            title: post.author_specialization
              ? `${post.author_specialization} · ${post.author_hospital || ""}`.trim()
              : post.author_hospital || undefined,
            clerk_id: post.author_clerk_id,
          },
          content: post.content ?? {},
          previewText: post.preview_text ?? "",
          firstImage: post.first_image,
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
    ));
  }
}
