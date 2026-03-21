"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export default function PostCardSkeleton() {
  return (
    <Card className="w-full shadow-none">
      {/* Header */}
      <CardHeader className="flex gap-3 items-center">
        <Skeleton className="w-10 h-10 rounded-full" />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded-lg" />
        </div>
      </CardHeader>

      {/* Body */}
      <CardBody className="space-y-2">
        <Skeleton className="h-3 w-full rounded-lg" />
        <Skeleton className="h-3 w-5/6 rounded-lg" />
        <Skeleton className="h-3 w-2/3 rounded-lg" />

        {/* <div className="h-16 w-full rounded-xl bg-transparent" /> */}
      </CardBody>

      {/* Footer */}
      <CardFooter className="flex justify-between">
        <Skeleton className="h-4 w-16 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-lg" />
      </CardFooter>
    </Card>
  );
}
