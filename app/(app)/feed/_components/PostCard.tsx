"use client";

import { useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import {
  Heart,
  Link,
  MessageCircle,
  Pencil,
  Repeat2,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useAuth } from "@clerk/nextjs";
import CommentEditor from "./CommentEditor";
import CommentItem from "./CommentItem";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { formatPostDate } from "@/utils/formatPostDate";
import { useRouter } from "next/navigation";
import { usePostComments } from "../_hooks/usePostComments";
import CommentItemSkeleton from "@/components/skeletons/CommentItemSkeleton";
import { MoreHorizontal } from "lucide-react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import CreatePostModal from "./CreatePostModal";
import { addToast } from "@heroui/toast";
import { apiUrl } from "@/utils/api";

dayjs.extend(relativeTime);

const COMMENTS_LIMIT = 5;

interface Post {
  id: string;
  title?: string;
  author: {
    name: string;
    avatar: string;
    title?: string;
    clerk_id?: string;
  };
  content: any; // TipTap JSON
  previewText: string;
  firstImage?: string | null;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isFollowingAuthor?: boolean;
  visibility?: string;
  isAnonymous?: boolean;
  tags?: string[];
}

interface PostCardProps {
  post: Post;
  className?: string;
  compact?: boolean;
  contentClickNavigate?: boolean;
  moreBehavior?: "expand" | "navigate";
  commentBehavior?: "toggle" | "navigate";
  initialShowComments?: boolean;
  showFollowButton?: boolean;
}

const PostCard = ({
  post = {
    id: "1",
    title: "Early detection of HCM in asymptomatic athletes",
    author: {
      name: "Dr. Arpit Bhayani",
      avatar: "https://i.pravatar.cc/150?u=arpit",
      title: "Cardiologist · AI Researcher",
    },
    previewText:
      "Here’s something counterintuitive about B+ trees — inserting keys in sorted order is fast, but it comes with an interesting hidden cost. When keys are inserted sequentially...",
    firstImage: "https://heroui.com/images/hero-card.jpeg",
    content: {},
    createdAt: "5h",
    likeCount: 271,
    commentCount: 5,
    tags: ["Cardiology", "Diagnostics", "Research"],
  },
  className = "",
  compact = false,
  contentClickNavigate = false,
  moreBehavior = "expand",
  commentBehavior = "toggle",
  initialShowComments = false,
  showFollowButton = true,
}: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [reposted, setReposted] = useState(post.isReposted ?? false);
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0);
  const [isFollowing, setIsFollowing] = useState(
    post.isFollowingAuthor ?? false,
  );

  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  const [showComments, setShowComments] = useState(initialShowComments);
  const [commentCount, setCommentCount] = useState(post.commentCount ?? 0);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: commentsLoading,
  } = usePostComments(post.id, showComments);

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const canOpenAuthorProfile = !post.isAnonymous && !!post.author?.clerk_id;
  const displayTitle = post.title?.trim() || "Clinical insight from practice";
  const displayTags =
    post.tags && post.tags.length > 0
      ? post.tags
      : ["Cardiology", "Diagnostics", "Research"];

  const { getToken } = useAuth();
  const { user } = useUser();
  const myClerkId = user?.id;
  const router = useRouter();
  const canRepost =
    !post.isAnonymous &&
    !!post.author?.clerk_id &&
    post.author.clerk_id !== myClerkId;

  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      console.log("mutation called");
      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl(`/posts/${postId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      return postId;
    },

    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });

      const previousFeed = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData(["feed"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          // `useFeedPosts` returns each page as an array of posts.
          pages: oldData.pages.map((page: any[]) =>
            page.filter((p: any) => String(p.id) !== String(postId)),
          ),
        };
      });

      return { previousFeed };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken({ template: "backend" });

      const res = await fetch(apiUrl(`/posts/${post.id}/repost`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Failed to repost");
      }

      return data as { reposted?: boolean };
    },
    onMutate: async () => {
      const nextReposted = !reposted;
      const nextRepostCount = Math.max(
        0,
        repostCount + (nextReposted ? 1 : -1),
      );

      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["post", post.id] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousPost = queryClient.getQueryData(["post", post.id]);

      setReposted(nextReposted);
      setRepostCount(nextRepostCount);

      queryClient.setQueryData(["feed"], (oldData: any) => {
        if (!oldData?.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any[]) =>
            page.map((p: any) =>
              String(p.id) === String(post.id)
                ? {
                    ...p,
                    is_reposted_by_me: nextReposted,
                    repost_count: nextRepostCount,
                  }
                : p,
            ),
          ),
        };
      });

      queryClient.setQueryData(["post", post.id], (oldPost: any) => {
        if (!oldPost) return oldPost;
        return {
          ...oldPost,
          is_reposted_by_me: nextReposted,
          repost_count: nextRepostCount,
        };
      });

      return { previousFeed, previousPost, reposted, repostCount };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(["feed"], context?.previousFeed);
      queryClient.setQueryData(["post", post.id], context?.previousPost);

      setReposted(context?.reposted ?? post.isReposted ?? false);
      setRepostCount(context?.repostCount ?? post.repostCount ?? 0);

      addToast({
        title: "Unable to repost",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        color: "danger",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

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

  const readOnlyEditor = useEditor({
    extensions: [StarterKit, CustomImage],
    content: post.content,
    editable: false,
    immediatelyRender: false,
  });

  function handleDeletePost() {
    console.log("delete clicked");

    deletePostMutation.mutate(post.id);
    setShowDeleteModal(false);
  }

  return (
    <>
      <Card
        className={`w-full rounded-2xl h-full flex flex-col border border-default-200 shadow-none ${className}`}
      >
        {/* HEADER */}
        <CardHeader className="flex justify-between items-start pb-3">
          <div
            className={`flex gap-3 ${
              canOpenAuthorProfile ? "cursor-pointer" : "cursor-default"
            }`}
            onClick={() => {
              if (!canOpenAuthorProfile) return;
              router.push(`/u/${post.author.clerk_id}`);
            }}
          >
            <Avatar
              radius="full"
              size="md"
              src={post.author.avatar}
              name={post.author.name}
            />
            <div>
              <h4 className="font-semibold text-sm">{post.author.name}</h4>

              <div className="flex items-center text-xs text-gray-500 space-x-1">
                {post.author.title && (
                  <>
                    <span>{post.author.title}</span>
                    <span>·</span>
                  </>
                )}
                <span>{formatPostDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Author Menu */}
          {post.author?.clerk_id === myClerkId && (
            <Dropdown>
              <DropdownTrigger>
                <button className="p-1 rounded-md hover:bg-gray-100">
                  <MoreHorizontal size={18} />
                </button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Post actions">
                <DropdownItem
                  key="edit"
                  onPress={() => handleEditPost()}
                  classNames={{
                    title: "flex gap-2 items-center",
                  }}
                >
                  <Pencil size={"18"} /> Edit Post
                </DropdownItem>

                <DropdownItem
                  key="copy_link"
                  onPress={handleCopyLink}
                  classNames={{
                    title: "flex gap-2 items-center",
                  }}
                >
                  <Link size={"18"} />
                  Copy link to post
                </DropdownItem>

                <DropdownItem
                  key="delete"
                  className="text-red-600 flex gap-2 items-center"
                  onPress={() => setShowDeleteModal(true)}
                  classNames={{
                    title: "flex gap-2 items-center",
                  }}
                >
                  <Trash2 size={18} />
                  Delete Post
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
          {/* Follow Button */}
          {showFollowButton &&
            !post.isAnonymous &&
            post.author?.clerk_id !== myClerkId && (
              <button
                onClick={() => {
                  if (isFollowing) {
                    setShowUnfollowModal(true);
                  } else {
                    handleFollowToggle();
                  }
                }}
                className={`text-xs font-medium px-3 py-1 rounded-full transition ${
                  isFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-primary text-white hover:bg-primary-600"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
        </CardHeader>

        {/* BODY */}
        <CardBody
          className={`text-sm text-gray-700 pt-0 space-y-3 flex-1 ${compact ? "pb-3" : ""}`}
        >
          <h3
            className={`${compact ? "text-base" : "text-[24px]"} font-bold leading-tight text-gray-900 ${
              contentClickNavigate ? "cursor-pointer hover:underline" : ""
            }`}
            onClick={() => {
              if (!contentClickNavigate) return;
              router.push(`/posts/${post.id}`);
            }}
          >
            {displayTitle}
          </h3>
          <>
            {!expanded && (
              <>
                <p
                  className={`whitespace-pre-line ${compact ? "line-clamp-4" : "line-clamp-3"} ${
                    contentClickNavigate ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (!contentClickNavigate) return;
                    router.push(`/posts/${post.id}`);
                  }}
                >
                  {post.previewText}
                </p>

                {post.previewText.length > 150 && (
                  <button
                    onClick={() => {
                      if (moreBehavior === "navigate") {
                        router.push(`/posts/${post.id}`);
                        return;
                      }
                      setExpanded(true);
                    }}
                    className="text-gray-500 text-sm hover:underline"
                  >
                    ...more
                  </button>
                )}

                {post.firstImage && (
                  <img
                    src={post.firstImage}
                    alt="Post image"
                    className={`rounded-lg w-full object-cover ${compact ? "h-36" : ""}`}
                  />
                )}
              </>
            )}

            <div className={expanded ? "block" : "hidden"}>
              {readOnlyEditor && <EditorContent editor={readOnlyEditor} />}
            </div>
          </>
        </CardBody>

        <div
          className={`px-4 pb-2 flex flex-wrap gap-2 ${compact ? "min-h-12" : ""}`}
        >
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ACTION BAR */}
        <CardFooter className="px-4 py-2 border-t border-default-100">
          <div className="flex w-full items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <Button
                onPress={handleLike}
                variant="flat"
                className={`flex rounded-full items-center gap-2 transition ${
                  liked ? "text-primary font-medium" : "hover:text-primary"
                }`}
              >
                <ThumbsUp size={16} className={liked ? "fill-primary" : ""} />
                <span>{likeCount}</span>
              </Button>

              <Button
                className="flex items-center rounded-full gap-2 transition hover:text-primary"
                variant="flat"
                onPress={() => {
                  if (commentBehavior === "navigate") {
                    router.push(`/posts/${post.id}?comments=1`);
                    return;
                  }
                  setShowComments((prev) => !prev);
                }}
              >
                <MessageCircle size={16} />
                <span>{commentCount}</span>
              </Button>

              <Button
                variant="flat"
                className={`flex items-center rounded-full gap-2 transition ${
                  reposted
                    ? "text-primary font-medium"
                    : canRepost
                      ? "hover:text-primary"
                      : "opacity-45 cursor-not-allowed"
                }`}
                onPress={handleRepost}
                disabled={!canRepost || repostMutation.isPending}
              >
                <Repeat2 size={16} />
                <span>{repostCount}</span>
              </Button>
            </div>

            <Button
              variant="flat"
              className="flex items-center rounded-full gap-2 transition hover:text-primary"
            >
              <Send size={16} />
            </Button>
          </div>
        </CardFooter>
        {showComments && (
          <div className="px-4 pb-4 space-y-3">
            {/* Add Comment */}
            <CommentEditor
              postId={post.id}
              onCommentAdded={(newComment) => {
                setCommentCount((prev) => prev + 1);
              }}
            />

            {commentsLoading && (
              <>
                <CommentItemSkeleton />
                <CommentItemSkeleton />
              </>
            )}

            {/* Comments List */}
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                postId={post.id}
                comment={comment}
                onDeleted={() =>
                  setCommentCount((prev) => Math.max(0, prev - 1))
                }
              />
            ))}

            {/* Load More */}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-sm text-gray-500 hover:underline"
              >
                {isFetchingNextPage ? (
                  <>
                    <CommentItemSkeleton />
                    <CommentItemSkeleton />
                  </>
                ) : (
                  "Load more comments"
                )}
              </button>
            )}
          </div>
        )}
      </Card>
      <Modal
        isOpen={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
        size="4xl"
      >
        <ModalContent>
          <ModalBody className="p-0 bg-black">
            {selectedImage && (
              <img
                src={selectedImage}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={showUnfollowModal}
        onOpenChange={() => setShowUnfollowModal(false)}
      >
        <ModalContent>
          <ModalBody className="p-6 space-y-4">
            <p className="text-center">
              Unfollow{" "}
              <span className="font-semibold">{post.author?.name}</span>?
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
      <Modal
        isOpen={showDeleteModal}
        onOpenChange={() => setShowDeleteModal(false)}
        size="sm"
        placement="top"
      >
        <ModalContent>
          <ModalBody className="p-0 gap-0">
            <ModalHeader className="justify-center px-3 pt-4 pb-2">
              Delete this post?
            </ModalHeader>

            <ModalBody className="text-sm text-gray-500 text-center py-2 px-3">
              Are you sure you want to permanently remove this post from Serona?
            </ModalBody>

            <ModalFooter className="flex gap-4 pt-2 border-t-1 border-default-200 px-3">
              <Button
                variant="bordered"
                className="border-1"
                size="sm"
                onPress={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                onPress={handleDeletePost}
                color="danger"
                size="sm"
                disabled={deletePostMutation.isPending}
                className="disabled:opacity-50"
              >
                Delete
              </Button>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
      <CreatePostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        mode="edit"
        postId={post.id}
        initialPost={{
          title: post.title ?? "",
          content: post.content,
          visibility: post.visibility ?? "public",
          isAnonymous: post.isAnonymous ?? false,
          tags: post.tags ?? [],
        }}
      />
    </>
  );

  async function handleLike() {
    // Optimistic UI
    const newLiked = !liked;

    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      const token = await getToken({ template: "backend" });

      await fetch(apiUrl(`/posts/${post.id}/like`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Like failed:", error);

      // Rollback on error
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  }

  async function handleFollowToggle() {
    if (!post.author?.clerk_id) return;

    try {
      const token = await getToken({ template: "backend" });

      const response = await fetch(apiUrl(`/follows/${post.author.clerk_id}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setIsFollowing(data.following);
      setShowUnfollowModal(false);
    } catch (error) {
      console.error("Follow toggle failed:", error);
    }
  }

  function handleRepost() {
    if (!canRepost || repostMutation.isPending) return;
    repostMutation.mutate();
  }

  function handleEditPost() {
    setShowEditModal(true);
  }

  async function handleCopyLink() {
    if (typeof window === "undefined") return;

    const postLink = `${window.location.origin}/posts/${post.id}`;

    try {
      await navigator.clipboard.writeText(postLink);
      addToast({
        title: "Link copied to clipboard",
        endContent: (
          <Button
            size="sm"
            variant="flat"
            onPress={() => router.push(`/posts/${post.id}`)}
          >
            View post
          </Button>
        ),
      });
    } catch (error) {
      console.error("Failed to copy post link:", error);
    }
  }
};

export default PostCard;
