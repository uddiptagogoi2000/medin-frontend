"use client";

import { useParams } from "next/navigation";
import RecentPostsPanel from "../../_components/RecentPostsPanel";

export default function UserPostsPage() {
  const { clerkId } = useParams();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
        <p className="text-sm text-gray-500">All published posts from this profile.</p>
      </div>

      <RecentPostsPanel clerkId={clerkId as string} showContainer={false} />
    </div>
  );
}
