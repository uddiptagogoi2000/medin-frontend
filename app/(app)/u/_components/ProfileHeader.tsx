"use client";

import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import EditProfileModal from "./EditProfileModal";
import ProfilePhotoModal from "./ProfilePhotoModal";
import { Avatar } from "@heroui/avatar";
import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { MapPin, ShieldCheck } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { apiUrl } from "@/utils/api";

interface Props {
  profile: any;
  isOwn: boolean;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
}

export default function ProfileHeader({ profile, isOwn, setProfile }: Props) {
  const { identity, basic, stats } = profile;
  const { getToken } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  useEffect(() => {
    setIsFollowing(
      Boolean(
        profile?.is_following ??
          profile?.is_following_author ??
          profile?.relationship?.is_following,
      ),
    );
  }, [profile]);

  return (
    <>
      <div className="overflow-hidden bg-white">
        <div className="relative h-52 overflow-hidden bg-gradient-to-r from-[#6fc8bf] to-[#1d9f95]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white/90 rotate-45 shadow-2xl" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#f3f4f6]" />
        </div>

        <div className="px-6 pb-6 bg-[#f3f4f6]">
          <div className="-mt-14 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setIsPhotoOpen(true)}
              >
                <Avatar
                  radius="lg"
                  src={identity.avatar || undefined}
                  name={identity.name}
                  className="h-28 w-28 border-4 border-white"
                />
              </button>

              <div className="pb-2 z-10">
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {identity?.name}
                  </h1>
                  <ShieldCheck size={18} className="text-primary" />
                </div>

                <p className="text-sm font-semibold text-primary mt-1">
                  {basic?.specialization || "Cardiology Specialist"}
                  {basic?.hospital ? ` • ${basic.hospital}` : ""}
                </p>

                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>
                    {[basic?.city, basic?.state].filter(Boolean).join(", ") ||
                      "Location not set"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-2">
              {isOwn ? (
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={() => setIsEditOpen(true)}
                >
                  Edit profile
                </Button>
              ) : (
                <Button
                  size="sm"
                  color={isFollowing ? "default" : "primary"}
                  variant={isFollowing ? "flat" : "solid"}
                  isDisabled={isFollowPending}
                  onPress={handleFollowButtonPress}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-white px-4 py-4 text-center sm:grid-cols-4">
            <Stat label="Years Exp." value={`${basic?.experience || 0}+`} />
            <Stat label="Cases" value={stats?.cases_count || 0} />
            <Stat label="Followers" value={stats?.followers || 0} />
            <Stat label="Following" value={stats?.following || 0} />
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        profile={profile}
        setProfile={setProfile}
      />

      <ProfilePhotoModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        profile={profile}
        setProfile={setProfile}
      />

      <Modal
        isOpen={showUnfollowModal}
        onOpenChange={() => setShowUnfollowModal(false)}
      >
        <ModalContent>
          <ModalBody className="p-6 space-y-4">
            <p className="text-center">
              Unfollow <span className="font-semibold">{identity?.name}</span>?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowUnfollowModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleFollowToggle}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Unfollow
              </button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );

  function handleFollowButtonPress() {
    if (isFollowing) {
      setShowUnfollowModal(true);
      return;
    }
    handleFollowToggle();
  }

  async function handleFollowToggle() {
    if (!identity?.clerk_id || isFollowPending) return;

    const previous = isFollowing;
    const next = !previous;

    setIsFollowing(next);
    setIsFollowPending(true);

    try {
      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl(`/follows/${identity.clerk_id}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update follow");
      }

      const data = await response.json();
      setIsFollowing(Boolean(data?.following));
      setShowUnfollowModal(false);
    } catch (error) {
      console.error("Follow toggle failed:", error);
      setIsFollowing(previous);
    } finally {
      setIsFollowPending(false);
    }
  }
}

function Stat({ label, value }: any) {
  return (
    <div>
      <p className="text-4xl font-bold text-primary leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
        {label}
      </p>
    </div>
  );
}
