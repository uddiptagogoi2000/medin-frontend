"use client";

import { useMyProfile } from "@/app/hooks/queries/useMyProfile";

import UserSummaryCard from "@/components/user/UserSummaryCard";
import CreatePostCard from "./_components/CreatePostCard";
import FeedList from "./_components/FeedList";
import UserSummaryCardSkeleton from "@/components/skeletons/UserSummaryCardSkeleton";

export default function FeedPage() {
  const { data: profile, isLoading } = useMyProfile();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="col-span-1 space-y-4">
          {isLoading ? (
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

        {/* MAIN FEED */}
        <div className="col-span-3 space-y-6">
          <CreatePostCard
            avatarUrl={profile?.identity?.avatar}
            name={profile?.identity?.name}
          />

          <FeedList />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-2 space-y-4">
          {/* Future: SuggestedDoctors / Trending */}
        </div>
      </div>
    </div>
  );
}
