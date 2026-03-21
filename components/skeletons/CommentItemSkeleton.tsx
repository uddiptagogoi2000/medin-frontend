"use client";

import { Skeleton } from "@heroui/skeleton";

export default function CommentItemSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="w-8 h-8 rounded-full" />

      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}
