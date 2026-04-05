"use client";

import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Avatar } from "@heroui/avatar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/utils/api";

dayjs.extend(relativeTime);

interface CommentItemProps {
  postId: string;
  comment: {
    id: number | string;
    content: any;
    created_at: string;
    optimistic?: boolean;
    author: {
      clerk_id: string;
      name: string;
      avatar?: string | null;
      title?: string | null;
      specialization?: string | null;
      hospital?: string | null;
    };
  };
  onDeleted?: () => void;
}

export default function CommentItem({ postId, comment, onDeleted }: CommentItemProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { getToken } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const isMyComment = user?.id === comment.author?.clerk_id;
  const timeAgo = dayjs(comment.created_at).fromNow();

  const ImageComponent = (props: any) => {
    const { node } = props;

    return (
      <NodeViewWrapper className="w-full flex justify-center my-3">
        <img
          src={node.attrs.src}
          onClick={() => setSelectedImage(node.attrs.src)}
          className="cursor-zoom-in rounded-lg max-w-full transition hover:opacity-90"
        />
      </NodeViewWrapper>
    );
  };

  const CustomImage = Image.extend({
    addNodeView() {
      return ReactNodeViewRenderer(ImageComponent);
    },
  });

  const readEditor = useEditor({
    extensions: [StarterKit, CustomImage],
    content: comment.content,
    editable: false,
    immediatelyRender: false,
  });

  const editEditor = useEditor({
    extensions: [StarterKit, CustomImage],
    content: comment.content,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!readEditor) return;
    readEditor.commands.setContent(comment.content ?? "", {
      emitUpdate: false,
    });
  }, [readEditor, comment.content]);

  useEffect(() => {
    if (!showEditModal || !editEditor) return;
    editEditor.commands.setContent(comment.content ?? "");
  }, [showEditModal, editEditor, comment.content]);

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ template: "backend" });

      const response = await fetch(
        apiUrl(`/posts/${postId}/comment/${comment.id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return response.json();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] });

      const previousData = queryClient.getQueryData(["post-comments", postId]);
      let removed = false;

      queryClient.setQueryData(["post-comments", postId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const nextComments = page.comments.filter((c: any) => {
              const isTarget = String(c.id) === String(comment.id);
              if (isTarget) removed = true;
              return !isTarget;
            });

            return {
              ...page,
              comments: nextComments,
            };
          }),
        };
      });

      return { previousData, removed };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["post-comments", postId], context?.previousData);
    },

    onSuccess: (_res, _vars, context) => {
      if (context?.removed) onDeleted?.();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async (content: any) => {
      const token = await getToken({ template: "backend" });

      const response = await fetch(
        apiUrl(`/posts/${postId}/comment/${comment.id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      return response.json();
    },

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["post-comments", postId] });

      const previousData = queryClient.getQueryData(["post-comments", postId]);

      queryClient.setQueryData(["post-comments", postId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((c: any) =>
              String(c.id) === String(comment.id)
                ? {
                    ...c,
                    content,
                  }
                : c,
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["post-comments", postId], context?.previousData);
    },

    onSuccess: (updatedComment) => {
      queryClient.setQueryData(["post-comments", postId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((c: any) =>
              String(c.id) === String(updatedComment.id) ? updatedComment : c,
            ),
          })),
        };
      });

      setShowEditModal(false);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
    },
  });

  const handleEditSave = () => {
    if (!editEditor) return;
    const content = editEditor.getJSON();
    const isEmpty = !content?.content || content.content.length === 0;
    if (isEmpty) return;

    editCommentMutation.mutate(content);
  };

  return (
    <>
      <div className={`flex gap-3 ${comment.optimistic ? "opacity-60" : ""}`}>
        <Avatar
          radius="full"
          size="sm"
          src={comment.author.avatar || undefined}
          name={comment.author.name}
        />

        <div className="flex-1 bg-gray-100 rounded-xl px-3 py-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-800 text-sm">
                {comment.author?.name || "Doctor"}
              </span>

              {comment.author?.title && (
                <span className="text-gray-400">· {comment.author.title}</span>
              )}

              {comment.author?.specialization && (
                <span className="text-gray-400">
                  · {comment.author.specialization}
                </span>
              )}

              {comment.author?.hospital && (
                <span className="text-gray-400">· {comment.author.hospital}</span>
              )}

              <span className="text-gray-400">· {timeAgo}</span>
            </div>

            {isMyComment && !comment.optimistic && (
              <Dropdown>
                <DropdownTrigger>
                  <button className="p-1 rounded-md hover:bg-gray-200">
                    <MoreHorizontal size={16} />
                  </button>
                </DropdownTrigger>

                <DropdownMenu aria-label="Comment actions">
                  <DropdownItem
                    key="edit"
                    classNames={{ title: "flex gap-2 items-center" }}
                    onPress={() => setShowEditModal(true)}
                  >
                    <Pencil size={16} /> Edit
                  </DropdownItem>

                  <DropdownItem
                    key="delete"
                    className="text-red-600"
                    classNames={{ title: "flex gap-2 items-center" }}
                    onPress={() => setShowDeleteModal(true)}
                  >
                    <Trash2 size={16} /> Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            {readEditor && <EditorContent editor={readEditor} />}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
        size="4xl"
      >
        <ModalContent>
          <ModalBody className="p-0 bg-black">
            {selectedImage && (
              <img src={selectedImage} className="w-full max-h-[80vh] object-contain" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={showDeleteModal} onOpenChange={() => setShowDeleteModal(false)}>
        <ModalContent>
          <ModalBody className="p-0 gap-0">
            <ModalHeader className="justify-center px-3 pt-4 pb-2">
              Delete this comment?
            </ModalHeader>

            <ModalBody className="text-sm text-gray-500 text-center py-2 px-3">
              This action cannot be undone.
            </ModalBody>

            <ModalFooter className="flex gap-3 border-t border-default-200 px-3">
              <Button variant="bordered" size="sm" onPress={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                color="danger"
                size="sm"
                onPress={() => {
                  deleteCommentMutation.mutate();
                  setShowDeleteModal(false);
                }}
                isDisabled={deleteCommentMutation.isPending}
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onOpenChange={() => setShowEditModal(false)}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="border-b">Edit Comment</ModalHeader>
          <ModalBody className="py-4">
            <div className="bg-gray-100 rounded-xl px-3 py-2">
              {editEditor && (
                <EditorContent editor={editEditor} className="outline-none text-sm" />
              )}
            </div>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button variant="light" onPress={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleEditSave}
              isDisabled={editCommentMutation.isPending}
            >
              {editCommentMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
