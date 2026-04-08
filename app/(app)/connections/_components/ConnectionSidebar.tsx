"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Users, UserRoundCheck, LayoutGrid } from "lucide-react";

interface ConnectionsSidebarProps {
  tab?: string;
}

export default function ConnectionsSidebar({ tab }: ConnectionsSidebarProps) {
  const router = useRouter();

  const isFollowers = tab === "followers";
  const isFollowing = tab === "following";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white shadow-sm p-5">
        <p className="font-semibold text-base text-gray-800 mb-4">
          Manage Connections
        </p>

        <div className="space-y-2">
          <button
            onClick={() => router.push("/connections?tab=followers")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
              isFollowers
                ? "bg-[#d8f1ef] text-[#136f69]"
                : "text-gray-600 hover:bg-default-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users size={14} />
              Followers
            </span>
            {/* <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">1.2k</span> */}
          </button>

          <button
            onClick={() => router.push("/connections?tab=following")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
              isFollowing
                ? "bg-[#d8f1ef] text-[#136f69]"
                : "text-gray-600 hover:bg-default-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <UserRoundCheck size={14} />
              Following
            </span>
            {/* <span className="rounded-full bg-default-100 px-2 py-0.5 text-xs">842</span> */}
          </button>

          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-default-100 transition"
            onClick={() => router.push("/connections")}
          >
            <LayoutGrid size={14} />
            Groups
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#acd9d5] bg-[#d8f1ef] p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#0b6d66]">
          <Sparkles size={14} />
          Suggested for You
        </p>
        <p className="mt-2 text-xs leading-5 text-[#356764]">
          Based on your clinical interest in Cardiology and preventive medicine.
        </p>
        <button className="mt-4 w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0b6d66] hover:bg-default-100 transition">
          View Insights
        </button>
      </div>
    </div>
  );
}
