"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/utils/api";

export function useMyProfile() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl("/profile/me"), {
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
