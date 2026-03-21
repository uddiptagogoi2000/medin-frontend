"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

export function useMyProfile() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const token = await getToken({ template: "backend" });

      const res = await fetch("http://localhost:8000/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch profile");

      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
}