"use client";

import { Skeleton } from "@heroui/skeleton";

export default function UserSummaryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 flex flex-col items-start gap-3">
      <Skeleton className="w-14 h-14 rounded-full" />

      <Skeleton className="h-3 w-full rounded-lg" />

      <Skeleton className="h-3 w-20 rounded-lg" />
    </div>
  );
}
