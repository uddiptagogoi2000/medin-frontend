"use client";
import { Avatar } from "@heroui/avatar";
import { Button, ButtonGroup } from "@heroui/button";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Image, Newspaper, Video } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import { useEffect, useState } from "react";

interface CreatePostCardProps {
  avatarUrl?: string;
  name?: string;
}

const CreatePostCard = ({ avatarUrl, name }: CreatePostCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card className="max-w-full shadow-none">
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
              onClick={() => setIsOpen(true)}
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
              onPress={() => setIsOpen(true)}
            >
              Video
            </Button>

            <Button
              variant="light"
              className="flex-1 rounded-none py-2 text-sm"
              startContent={<Image />}
              onPress={() => setIsOpen(true)}
            >
              Photo
            </Button>

            <Button
              variant="light"
              className="flex-1 rounded-none py-2 text-sm"
              startContent={<Newspaper />}
              onPress={() => setIsOpen(true)}
            >
              Write article
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CreatePostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default CreatePostCard;
