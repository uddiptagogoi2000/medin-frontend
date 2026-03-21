"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import ProfileHeader from "../_components/ProfileHeader";
import AboutSection from "../_components/AboutSection";
import ExperienceSection from "../_components/ExperienceSection";
import RecentPostsPanel from "../_components/RecentPostsPanel";

export default function ProfilePage() {
  const { clerkId } = useParams();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === clerkId;

  useEffect(() => {
    if (clerkId) {
      fetchProfile();
    }
  }, [clerkId]);

  async function fetchProfile() {
    try {
      const token = await getToken({ template: "backend" });

      const res = await fetch(`http://localhost:8000/profile/${clerkId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-7xl mx-auto pb-8 space-y-6">
      <ProfileHeader
        profile={profile}
        isOwn={isOwnProfile}
        setProfile={setProfile}
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <AboutSection
            profile={profile}
            isOwn={isOwnProfile}
            setProfile={setProfile}
          />

          <RecentPostsPanel
            clerkId={clerkId as string}
            variant="slider"
            limit={8}
            showViewAll
          />

          <ExperienceSection
            profile={profile}
            isOwn={isOwnProfile}
            setProfile={setProfile}
          />
        </div>
      </div>
    </div>
  );
}
