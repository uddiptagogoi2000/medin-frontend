"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import DoctorCard from "./DoctorCard";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/utils/api";

export default function FollowingList() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, []);

  async function fetchFollowing() {
    try {
      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl("/connections/following"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setFollowing(data);
    } catch (err) {
      console.error("Following fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading following...</p>;

  if (following.length === 0)
    return <p className="text-gray-500">You are not following anyone yet.</p>;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/connections")}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <ArrowLeft size={14} />
        Back to Connections
      </button>

      <h2 className="text-4xl font-bold text-gray-900">Following</h2>

      {following.map((user) => (
        <DoctorCard key={user.clerk_id} doctor={user} />
      ))}

      <div className="pt-3">
        <button className="mx-auto block rounded-full bg-default-100 px-6 py-2 text-sm font-semibold text-primary hover:bg-default-200 transition">
          Load More Following
        </button>
      </div>
    </div>
  );
}
