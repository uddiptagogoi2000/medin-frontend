"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { apiUrl } from "@/utils/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  setProfile: (val: any) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  setProfile,
}: Props) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    city: profile.basic.city || "",
    state: profile.basic.state || "",
    specialization: profile.basic.specialization || "",
    hospital: profile.basic.hospital || "",
    experience: profile.basic.experience || 0,
  });

  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      const token = await getToken({ template: "backend" });

      // 1️⃣ Update Clerk Identity
      await fetch(apiUrl("/profile/identity"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
        }),
      });

      // 2️⃣ Update DB Professional Info
      const res = await fetch(apiUrl("/profile/basic"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: form.city,
          state: form.state,
          specialization: form.specialization,
          hospital: form.hospital,
          experience: form.experience,
        }),
      });

      const updatedBasic = await res.json();

      // Update UI state
      setProfile((prev: any) => ({
        ...prev,
        identity: {
          ...prev.identity,
          name: `${form.firstName} ${form.lastName}`,
        },
        basic: updatedBasic,
      }));

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>

        <ModalBody className="space-y-4">
          {/* Identity */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          {/* Professional Info */}
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
          />

          <Input
            label="Hospital"
            value={form.hospital}
            onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          />

          <Input
            label="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <Input
            label="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />

          <Input
            type="number"
            label="Experience (Years)"
            value={String(form.experience)}
            onChange={(e) =>
              setForm({ ...form, experience: Number(e.target.value) })
            }
          />
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={loading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
