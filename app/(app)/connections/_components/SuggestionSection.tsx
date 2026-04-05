"use client";

import UserSummaryCard from "@/components/user/UserSummaryCard";
import { useSuggestions } from "../_hooks/useSuggestions";
import { Building2, Stethoscope } from "lucide-react";

export default function SuggestionsSection() {
  const { data, isLoading } = useSuggestions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, sectionIdx) => (
          <div
            key={sectionIdx}
            className="rounded-2xl border border-default-200 bg-white p-5"
          >
            <div className="mb-4 h-6 w-64 animate-pulse rounded bg-default-200" />
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((__, cardIdx) => (
                <div
                  key={cardIdx}
                  className="h-44 animate-pulse rounded-xl bg-default-100"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const hasHospital = data.same_hospital.length > 0;
  const hasSpecialization = data.same_specialization.length > 0;

  return (
    <div className="space-y-6">
      {/* SAME HOSPITAL */}
      {hasHospital && (
        <section className="rounded-2xl border border-default-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary-50 p-2 text-primary">
                <Building2 size={16} />
              </div>
              <h2 className="font-semibold text-lg text-gray-900">
                Doctors from your hospital
              </h2>
            </div>
            <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-gray-600">
              {data.same_hospital.length} suggestions
            </span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>
      )}

      {/* SAME SPECIALIZATION */}
      {hasSpecialization && (
        <section className="rounded-2xl border border-default-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-secondary-50 p-2 text-secondary">
                <Stethoscope size={16} />
              </div>
              <h2 className="font-semibold text-lg text-gray-900">
                Doctors in your specialization
              </h2>
            </div>
            <span className="rounded-full bg-default-100 px-3 py-1 text-xs font-medium text-gray-600">
              {data.same_specialization.length} suggestions
            </span>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        </section>
      )}
    </div>
  );
}
