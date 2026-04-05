"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";

export interface EngagementPrompt {
  id: number;
  title: string;
  body: string;
  suggested_tags: string[];
}

interface EngagementPromptModalProps {
  prompt: EngagementPrompt | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onWritePost: () => void;
  onMaybeLater: () => void;
}

export default function EngagementPromptModal({
  prompt,
  isOpen,
  onOpenChange,
  onWritePost,
  onMaybeLater,
}: EngagementPromptModalProps) {
  if (!prompt) return null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom-center"
      size="2xl"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="pb-2">
          <div>
            <p className="text-base font-semibold text-gray-900">{prompt.title}</p>
          </div>
        </ModalHeader>

        <ModalBody className="pt-0">
          <p className="text-sm leading-relaxed text-gray-600">{prompt.body}</p>

          {prompt.suggested_tags?.length > 0 ? (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500">
                Suggested tags
              </p>
              <div className="flex flex-wrap gap-2">
                {prompt.suggested_tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    radius="sm"
                    variant="flat"
                    className="bg-primary-50 text-primary-700"
                  >
                    #{tag}
                  </Chip>
                ))}
              </div>
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onMaybeLater}>
            Maybe later
          </Button>
          <Button color="primary" onPress={onWritePost}>
            Write a post
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

