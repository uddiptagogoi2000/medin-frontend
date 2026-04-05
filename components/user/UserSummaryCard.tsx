"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import clsx from "clsx";

interface Props {
  clerkId: string;
  name: string;
  avatar?: string | null;
  specialization?: string | null;
  hospital?: string | null;

  variant?: "default" | "centered";
  showFollowButton?: boolean;
}

export default function UserSummaryCard({
  clerkId,
  name,
  avatar,
  specialization,
  hospital,
  variant = "default",
  showFollowButton = false,
}: Props) {
  const router = useRouter();

  const isCentered = variant === "centered";

  return (
    <div
      onClick={() => router.push(`/u/${clerkId}`)}
      className="bg-white border border-default-200 rounded-xl overflow-hidden cursor-pointer transition duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Cover */}
      <div className="relative h-16 bg-gray-200 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url('/topography.svg')",
            backgroundSize: "500px",
          }}
        />
      </div>

      {/* Content */}
      <div
        className={clsx(
          "px-4 pb-4",
          isCentered && "flex flex-col items-center text-center",
        )}
      >
        {/* Avatar */}
        <div className="-mt-8">
          <Avatar
            src={avatar || undefined}
            name={name}
            className="w-16 h-16 border-4 border-white"
          />
        </div>

        {/* Info */}
        <div className="mt-3">
          <h3 className="font-semibold text-sm">{name}</h3>

          {specialization && (
            <p className="text-xs text-gray-600 mt-1">{specialization}</p>
          )}

          {hospital && <p className="text-xs text-gray-500 mt-1">{hospital}</p>}
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <Button
            size="sm"
            color="default"
            variant="bordered"
            className="mt-3 w-full rounded-full"
            onPress={(e: any) => {
              e.stopPropagation();
              console.log("Follow clicked:", clerkId);
            }}
          >
            Follow
          </Button>
        )}
      </div>
    </div>
  );
}
