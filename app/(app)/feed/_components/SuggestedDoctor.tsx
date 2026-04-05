"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/utils/api";

interface SuggestedDoctor {
  clerk_id: string;
  name?: string;
  avatar?: string | null;
  specialization?: string | null;
  hospital?: string | null;
  city?: string | null;
  experience?: number | null;
  is_following: boolean;
}

export default function SuggestedDoctors() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [doctors, setDoctors] = useState<SuggestedDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl("/follows/suggestions"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow(clerkId: string) {
    try {
      setFollowLoadingId(clerkId);

      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl(`/follows/${clerkId}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.following) {
        // Remove from suggestions after follow
        setDoctors((prev) => prev.filter((doc) => doc.clerk_id !== clerkId));
      }
    } catch (error) {
      console.error("Follow failed:", error);
    } finally {
      setFollowLoadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-sm">Suggested Doctors</p>
        <button
          onClick={() => router.push("/connections")}
          className="text-xs text-blue-600 hover:underline"
        >
          View more
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-xs text-gray-500">No suggestions available.</p>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.clerk_id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar
                  radius="full"
                  size="sm"
                  src={doctor.avatar || undefined}
                />
                <div>
                  <p className="text-sm font-medium">
                    {doctor.name || "Doctor"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doctor.specialization}
                    {doctor.hospital && ` · ${doctor.hospital}`}
                  </p>
                </div>
              </div>

              <button
                disabled={followLoadingId === doctor.clerk_id}
                onClick={() => handleFollow(doctor.clerk_id)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition disabled:opacity-50"
              >
                {followLoadingId === doctor.clerk_id ? "..." : "Follow"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
