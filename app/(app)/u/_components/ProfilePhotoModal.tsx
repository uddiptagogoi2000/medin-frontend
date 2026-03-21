"use client";

import { Modal, ModalBody, ModalContent } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  setProfile: any;
}

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  profile,
  setProfile,
}: Props) {
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const avatarUrl = preview || profile.identity.avatar;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    await uploadAvatar(file);
  }

  async function uploadAvatar(file: File) {
    try {
      setLoading(true);

      const token = await getToken({ template: "backend" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/profile/avatar", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      setProfile((prev: any) => ({
        ...prev,
        identity: {
          ...prev.identity,
          avatar: data.avatar_url,
        },
      }));

      setPreview(null);
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      const token = await getToken({ template: "backend" });

      await fetch("http://localhost:8000/profile/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile((prev: any) => ({
        ...prev,
        identity: {
          ...prev.identity,
          avatar: null,
        },
      }));

      onClose();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        <ModalBody className="py-8 flex flex-col items-center gap-6">
          <div className="relative">
            <Avatar
              src={avatarUrl || undefined}
              name={profile.identity.name}
              className="w-48 h-48 text-4xl"
            />

            {loading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                Uploading...
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onPress={() => fileInputRef.current?.click()}
              color="primary"
            >
              Update
            </Button>

            {profile.identity.avatar && (
              <Button color="danger" variant="flat" onPress={handleDelete}>
                Delete
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
