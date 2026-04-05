"use client";
import { Avatar } from "@heroui/avatar";
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Image, Newspaper, Video } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import { useState } from "react";

interface CreatePostCardProps {
  avatarUrl?: string;
  name?: string;
  isComposerOpen?: boolean;
  onComposerOpenChange?: (isOpen: boolean) => void;
  composerInitialDraft?: {
    title?: string;
    body?: string;
    tags?: string[];
    visibility?: string;
    isAnonymous?: boolean;
  };
  onPostCreated?: (post: any) => void;
}

const CreatePostCard = ({
  avatarUrl,
  name,
  isComposerOpen,
  onComposerOpenChange,
  composerInitialDraft,
  onPostCreated,
}: CreatePostCardProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = typeof isComposerOpen === "boolean";
  const open = controlled ? isComposerOpen : internalOpen;
  const setOpen = (nextOpen: boolean) => {
    if (controlled) {
      onComposerOpenChange?.(nextOpen);
      return;
    }
    setInternalOpen(nextOpen);
  };

  return (
    <>
      <Card className="max-w-full shadow-none border border-default-200">
        <CardHeader className="justify-between">
          <div className="flex gap-3 w-full items-center">
            <Avatar
              radius="full"
              src={avatarUrl}
              name={name}
              className="w-10 h-10 shrink-0"
            />
            <Input
              readOnly
              onClick={() => setOpen(true)}
              classNames={{
                inputWrapper: `
                rounded-full`,
              }}
              placeholder="What's on your mind?"
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardFooter className="p-0">
          <div className="flex w-full">
            <Button
              variant="light"
              className="flex-1 rounded-none py-2 text-sm"
              startContent={<Video />}
              onPress={() => setOpen(true)}
            >
              Video
            </Button>

            <Button
              variant="light"
              className="flex-1 rounded-none py-2 text-sm"
              startContent={<Image />}
              onPress={() => setOpen(true)}
            >
              Photo
            </Button>

            <Button
              variant="light"
              className="flex-1 rounded-none py-2 text-sm"
              startContent={<Newspaper />}
              onPress={() => setOpen(true)}
            >
              Write article
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initialDraft={composerInitialDraft}
        onPostCreated={onPostCreated}
      />
    </>
  );
};

export default CreatePostCard;
