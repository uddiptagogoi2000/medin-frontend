"use client";

import { useEffect, useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { RadioGroup, Radio } from "@heroui/radio";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { X, ImageIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  postId?: string;
  initialPost?: {
    title?: string;
    content?: any;
    tags?: string[];
    visibility?: string;
    isAnonymous?: boolean;
  };
}

export default function CreatePostModal({
  isOpen,
  onClose,
  mode = "create",
  postId,
  initialPost,
}: CreatePostModalProps) {
  const { getToken } = useAuth();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>(["Cardiology"]);
  const [visibility, setVisibility] = useState("public");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initializedForKeyRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  /* =============================
     Image NodeView
  ============================== */

  const ImageComponent = (props: any) => {
    const { node, editor, getPos } = props;

    const handleDelete = () => {
      editor
        .chain()
        .focus()
        .deleteRange({
          from: getPos(),
          to: getPos() + node.nodeSize,
        })
        .run();
    };

    return (
      <NodeViewWrapper
        className="relative inline-block image-wrapper cursor-grab active:cursor-grabbing"
        data-drag-handle
        draggable="true"
      >
        <img
          src={node.attrs.src}
          draggable={false}
          className={`rounded-lg transition-opacity duration-300 ${
            node.attrs.uploading ? "opacity-50" : "opacity-100"
          }`}
        />

        <button
          type="button"
          draggable={false}
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black transition"
        >
          <X size={14} />
        </button>
      </NodeViewWrapper>
    );
  };

  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        uploading: { default: false },
        tempId: { default: null },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ImageComponent);
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
      Placeholder.configure({
        placeholder: "Write your clinical case here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    if (!isOpen) {
      initializedForKeyRef.current = null;
      return;
    }

    const initKey = mode === "edit" ? `edit:${postId ?? ""}` : "create";
    if (initializedForKeyRef.current === initKey) return;

    if (mode === "edit") {
      setTitle(initialPost?.title ?? "");
      setTags(initialPost?.tags ?? []);
      setVisibility(initialPost?.visibility ?? "public");
      setIsAnonymous(initialPost?.isAnonymous ?? false);
      editor.commands.setContent(initialPost?.content ?? "");
      initializedForKeyRef.current = initKey;
      return;
    }

    setTitle("");
    setTags(["Cardiology"]);
    setVisibility("public");
    setIsAnonymous(false);
    editor.commands.clearContent();
    initializedForKeyRef.current = initKey;
  }, [editor, isOpen, mode, postId, initialPost]);

  /* =============================
     Image Upload
  ============================== */

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const localUrl = URL.createObjectURL(file);
    const tempId = crypto.randomUUID();

    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: { src: localUrl, uploading: true, tempId },
      })
      .run();

    try {
      const token = await getToken({ template: "backend" });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      const cloudinaryUrl = data.url;

      const img = new window.Image();
      img.src = cloudinaryUrl;

      img.onload = () => {
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.tempId === tempId) {
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  src: cloudinaryUrl,
                  uploading: false,
                });
                return true;
              })
              .run();
          }
        });
      };
    } catch (error) {
      console.error("Upload failed:", error);
    }

    event.target.value = "";
  };

  // const handleSubmit = async () => {
  //   if (!editor) return;

  //   const contentJSON = editor.getJSON();

  //   // Prevent empty posts
  //   const isEmpty =
  //     !title.trim() &&
  //     (!contentJSON.content || contentJSON.content.length === 0);

  //   if (isEmpty) return;

  //   try {
  //     setIsSubmitting(true);

  //     const token = await getToken({ template: "backend" });

  //     const response = await fetch("http://localhost:8000/posts/", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         title,
  //         content: contentJSON,
  //         tags,
  //         visibility,
  //         is_anonymous: isAnonymous,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to create post");
  //     }

  //     const data = await response.json();
  //     console.log("Created post:", data);

  //     // Reset state
  //     setTitle("");
  //     editor.commands.clearContent();
  //     setTags(["Cardiology"]);
  //     setVisibility("public");
  //     setIsAnonymous(false);

  //     onClose();
  //   } catch (error) {
  //     console.error("Post submit error:", error);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!editor) return;

    const contentJSON = editor.getJSON();

    const isEmpty =
      !title.trim() &&
      (!contentJSON.content || contentJSON.content.length === 0);

    if (isEmpty) return;

    try {
      setIsSubmitting(true);

      const token = await getToken({ template: "backend" });

      const isEditMode = mode === "edit" && !!postId;

      const response = await fetch(
        isEditMode
          ? `http://localhost:8000/posts/${postId}`
          : "http://localhost:8000/posts/",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content: contentJSON,
            tags,
            visibility,
            is_anonymous: isAnonymous,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          isEditMode ? "Failed to update post" : "Failed to create post",
        );
      }

      const savedPost = await response.json();

      if (isEditMode) {
        queryClient.setQueryData(["feed"], (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page: any[]) =>
              page.map((p: any) =>
                String(p.id) === String(savedPost.id) ? savedPost : p,
              ),
            ),
          };
        });
      } else {
        queryClient.setQueryData(["feed"], (old: any) => {
          if (!old) return old;
          const firstPage = old.pages?.[0] ?? [];

          return {
            ...old,
            pages: [[savedPost, ...firstPage], ...old.pages.slice(1)],
          };
        });
      }

      // Reset state
      setTitle("");
      editor.commands.clearContent();
      setTags(["Cardiology"]);
      setVisibility("public");
      setIsAnonymous(false);

      onClose();
    } catch (error) {
      console.error("Post submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =============================
     UI
  ============================== */

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
      <ModalContent>
        <ModalHeader className="border-b">
          <div className="text-lg font-semibold">
            {mode === "edit"
              ? "Edit Clinical Case"
              : "Create New Clinical Case"}
          </div>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="flex h-[500px]">
            {/* LEFT SIDE (2/3) */}
            <div className="w-2/3 p-6 border-r flex flex-col overflow-y-auto">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="text-2xl font-semibold outline-none border-none mb-4"
              />

              <div className="flex-1">
                <EditorContent
                  editor={editor}
                  className="h-full prose max-w-none outline-none"
                />
              </div>
            </div>

            {/* RIGHT SIDE (1/3) */}
            <div className="w-1/3 p-6 space-y-6 bg-gray-50">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  SPECIALTY TAGS
                </p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {tags.map((tag) => (
                    <Chip key={tag} color="primary" variant="flat">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <Input placeholder="Add specialty..." size="sm" />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  VISIBILITY & PRIVACY
                </p>
                <RadioGroup value={visibility} onValueChange={setVisibility}>
                  <Radio value="public">Public</Radio>
                  <Radio value="connections">Connections</Radio>
                  <Radio value="private">Private Draft</Radio>
                </RadioGroup>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium">Post Anonymously</p>
                  <p className="text-xs text-gray-500">
                    Your profile will be hidden.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>

        {/* FOOTER */}
        <ModalFooter className="border-t flex justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <b>B</b>
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <i>I</i>
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className="p-2 hover:bg-gray-100 rounded"
            >
              • List
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ImageIcon size={18} />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>

            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={isSubmitting}
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Publishing..."
                : mode === "edit"
                  ? "Save Changes"
                  : "Publish Case →"}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
