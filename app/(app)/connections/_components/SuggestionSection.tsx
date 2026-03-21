"use client";

import UserSummaryCard from "@/components/user/UserSummaryCard";
import { useSuggestions } from "../_hooks/useSuggestions";

export default function SuggestionsSection() {
  const { data, isLoading } = useSuggestions();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-24 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-10">
      {/* SAME HOSPITAL */}
      {data.same_hospital.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-4">
            Doctors from your hospital
          </h2>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
            {data.same_hospital.map((doctor: any) => (
              <UserSummaryCard
                key={doctor.clerk_id}
                clerkId={doctor.clerk_id}
                name={doctor.name}
                avatar={doctor.avatar}
                hospital={doctor.hospital}
                specialization={doctor.specialization}
                showFollowButton
                variant="centered"
              />
            ))}
          </div>
        </div>
      )}

      {/* SAME SPECIALIZATION */}
      {data.same_specialization.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-4">
            Doctors in your specialization
          </h2>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4">
            {data.same_specialization.map((doctor: any) => (
              <UserSummaryCard
                key={doctor.clerk_id}
                clerkId={doctor.clerk_id}
                name={doctor.name}
                avatar={doctor.avatar}
                hospital={doctor.hospital}
                specialization={doctor.specialization}
                showFollowButton
                variant="centered"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
