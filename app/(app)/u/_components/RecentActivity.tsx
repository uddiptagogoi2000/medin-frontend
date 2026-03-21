"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Tabs, Tab } from "@heroui/tabs";
import PostCard from "../../feed/_components/PostCard";

interface Props {
  clerkId: string;
}

export default function RecentActivity({ clerkId }: Props) {
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clerkId) {
      fetchPosts();
    }
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
      console.error("Activity fetch failed:", err);
      setPosts([]);
    } finally {
      setLoading(false);
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
        <Tab key="comments" title="Comments" isDisabled />
        <Tab key="likes" title="Likes" isDisabled />
      </Tabs>

      <div className="mt-6 space-y-6">
        {loading && (
          <div className="text-gray-500 text-sm">Loading activity...</div>
        )}

        {!loading && (activeTab === "all" || activeTab === "posts") && (
          <>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: String(post.id),
                    author: {
                      name: post.is_anonymous ? "Anonymous Doctor" : "Doctor",
                      avatar: "",
                      title: "",
                      clerk_id: post.author_clerk_id,
                    },
                    content: post.content,
                    previewText: post.preview_text ?? "",
                    firstImage: post.first_image,
                    createdAt: new Date(post.created_at).toLocaleString(),
                    likeCount: post.like_count ?? 0,
                    commentCount: post.comment_count ?? 0,
                    isLiked: false,
                    isFollowingAuthor: false,
                  }}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                No activity yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
