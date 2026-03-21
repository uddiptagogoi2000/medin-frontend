"use client";

import { Avatar } from "@heroui/avatar";
import { useRouter } from "next/navigation";
import type { SearchUser } from "../_hooks/useGlobalSearch";

interface SearchUserItemProps {
  user: SearchUser;
}

export default function SearchUserItem({ user }: SearchUserItemProps) {
  const router = useRouter();

  return (
    <button
      className="w-full text-left rounded-2xl border border-[#c9e8e4] bg-white px-4 py-3 hover:shadow-sm hover:border-[#9ed7d0] transition"
      onClick={() => router.push(`/u/${user.clerk_id}`)}
    >
      <div className="flex items-start gap-3">
        <Avatar
          radius="full"
          size="md"
          src={user.avatar ?? undefined}
          name={user.name}
        />

        <div className="min-w-0">
          <p className="font-semibold text-sm truncate text-gray-900">{user.name}</p>
          <p className="text-xs text-[#216c66] truncate font-medium">
            {user.specialization || "Doctor"}
            {user.hospital ? ` · ${user.hospital}` : ""}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {[user.city, user.state].filter(Boolean).join(", ") || "Location unavailable"}
          </p>
        </div>
      </div>
    </button>
  );
}
