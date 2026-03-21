"use client";

import { Avatar } from "@heroui/avatar";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { EllipsisVertical, MapPin, Share2 } from "lucide-react";

interface Doctor {
  clerk_id: string;
  full_name?: string;
  name?: string;
  avatar?: string | null;
  specialization?: string;
  hospital?: string;
  city?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onFollow?: (clerkId: string) => void;
}

export default function DoctorCard({ doctor, onFollow }: DoctorCardProps) {
  const { getToken } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFollow() {
    try {
      setLoading(true);

      const token = await getToken({ template: "backend" });

      const response = await fetch(
        `http://localhost:8000/follows/${doctor.clerk_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.following) {
        setIsFollowing(true);
        onFollow?.(doctor.clerk_id);
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-5 py-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative">
          <Avatar
            radius="full"
            size="lg"
            src={doctor.avatar || undefined}
            name={doctor.full_name || doctor.name || "Doctor"}
          />
          <span className="absolute -right-0.5 bottom-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-sm">
            {doctor.full_name || doctor.name || "Doctor"}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {doctor.specialization}
            {doctor.hospital && ` · ${doctor.hospital}`}
          </p>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Share2 size={10} /> <span>12 shared cases</span>
            </span>
            {doctor.city && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> <span>{doctor.city}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-3">
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`px-5 py-1.5 text-sm rounded-full font-semibold transition ${
            isFollowing
              ? "bg-gray-200 text-gray-700"
              : "bg-primary text-white hover:bg-primary-600"
          }`}
        >
          {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>

        <button className="p-1.5 rounded-full hover:bg-default-100 text-gray-500">
          <EllipsisVertical size={16} />
        </button>
      </div>
    </div>
  );
}
