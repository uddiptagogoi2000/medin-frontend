"use client";

import { useRef, useState } from "react";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { ImageIcon, X } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMyProfile } from "@/app/hooks/queries/useMyProfile";
import { apiUrl } from "@/utils/api";

interface CommentEditorProps {
  postId: string;
  onCommentAdded?: (comment: any) => void;
}

export default function CommentEditor({
  postId,
  onCommentAdded,
}: CommentEditorProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [isActive, setIsActive] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: user } = useMyProfile();

  // ------------------------
  // Mutation
  // ------------------------

  const createCommentMutation = useMutation({
    mutationFn: async (content: any) => {
      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl(`/posts/${postId}/comment`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      return response.json();
    },

    // 🔥 optimistic update
    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["post-comments", postId],
      });

      const previousData = queryClient.getQueryData(["post-comments", postId]);

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        author: {
          clerk_id: user?.identity?.clerk_id,
          name: user?.identity?.name || "You",
          avatar: user?.identity?.avatar || null,
          specialization: null,
          hospital: null,
        },
        optimistic: true,
      };

      queryClient.setQueryData(["post-comments", postId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];

        newPages[0] = {
          ...newPages[0],
          comments: [optimisticComment, ...newPages[0].comments],
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });

      return { previousData };
    },

    // rollback if error
    onError: (_err, _content, context) => {
      queryClient.setQueryData(
        ["post-comments", postId],
        context?.previousData,
      );
    },

    // replace optimistic comment with real one
    onSuccess: (newComment) => {
      queryClient.setQueryData(["post-comments", postId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];

        newPages[0] = {
          ...newPages[0],
          comments: newPages[0].comments.map((c: any) =>
            c.optimistic ? newComment : c,
          ),
        };

        return {
          ...oldData,
          pages: newPages,
        };
      });

      onCommentAdded?.(newComment);
    },
  });
  // ------------------------
  // Image Component
  // ------------------------

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
        className="relative w-full flex justify-center my-3 cursor-grab active:cursor-grabbing"
        data-drag-handle
        draggable="true"
      >
        <img
          src={node.attrs.src}
          draggable={false}
          className={`rounded-lg max-w-full transition-opacity duration-300 ${
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

  // ------------------------
  // Editor
  // ------------------------

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        blockquote: false,
      }),
      CustomImage,
      Placeholder.configure({
        placeholder: "Add a comment...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setIsActive(!editor.isEmpty);
      let containsImage = false;
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image") {
          containsImage = true;
          return false;
        }
        return true;
      });
      setHasImage(containsImage);
    },
  });

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

      const response = await fetch(apiUrl("/upload/image"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const data = await response.json();
      const uploadedUrl = data.url;

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.tempId === tempId) {
          editor
            .chain()
            .focus()
            .command(({ tr }) => {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                src: uploadedUrl,
                uploading: false,
              });
              return true;
            })
            .run();
        }
      });
    } catch (error) {
      console.error("Comment image upload failed:", error);

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.tempId === tempId) {
          editor
            .chain()
            .focus()
            .deleteRange({
              from: pos,
              to: pos + node.nodeSize,
            })
            .run();
        }
      });
    } finally {
      URL.revokeObjectURL(localUrl);
      event.target.value = "";
    }
  };

  // ------------------------
  // Submit Comment
  // ------------------------

  const handleSubmit = () => {
    if (!editor || editor.isEmpty) return;

    const content = editor.getJSON();

    createCommentMutation.mutate(content);

    editor.commands.clearContent();
    setIsActive(false);
  };

  return (
    <div className="space-y-2">
      {/* Editor */}
      <div
        className={`transition-all ${
          isActive
            ? "bg-gray-100 p-4 rounded-xl"
            : "bg-gray-100 px-4 py-2 rounded-full"
        }`}
      >
        <EditorContent editor={editor} className="outline-none text-sm" />
      </div>

      {/* Toolbar */}
      {isActive && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 text-gray-600">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="hover:bg-gray-200 p-1 rounded"
            >
              <b>B</b>
            </button>

            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="hover:bg-gray-200 p-1 rounded"
            >
              <i>I</i>
            </button>

            <button
              onClick={() => {
                if (hasImage) return;
                fileInputRef.current?.click();
              }}
              disabled={hasImage}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ImageIcon size={16} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={hasImage}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={createCommentMutation.isPending}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
