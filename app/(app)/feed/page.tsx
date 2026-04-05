"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMyProfile } from "@/app/hooks/queries/useMyProfile";

import UserSummaryCard from "@/components/user/UserSummaryCard";
import CreatePostCard from "./_components/CreatePostCard";
import FeedList from "./_components/FeedList";
import UserSummaryCardSkeleton from "@/components/skeletons/UserSummaryCardSkeleton";
import EngagementPromptModal, {
  EngagementPrompt,
} from "./_components/EngagementPromptModal";
import { apiUrl } from "@/utils/api";

type PromptEventType = "shown" | "dismissed" | "clicked_post" | "posted";

export default function FeedPage() {
  const { getToken } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDraft, setComposerDraft] = useState<{
    title?: string;
    body?: string;
    tags?: string[];
  } | null>(null);
  const [prompt, setPrompt] = useState<EngagementPrompt | null>(null);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const pendingPostedPromptIdRef = useRef<number | null>(null);
  const promptFetchDoneRef = useRef(false);
  const promptHandledRef = useRef(false);
  const promptShownTrackedRef = useRef(false);
  const ignoreNextPromptCloseRef = useRef(false);
  const showPromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPosts = [
    {
      title: "AI-guided ECG triage reducing ER wait time",
      time: "2h ago",
      likes: 84,
      comments: 19,
    },
    {
      title: "How we redesigned sepsis alert handoff protocols",
      time: "5h ago",
      likes: 61,
      comments: 12,
    },
    {
      title: "Case insight: atypical STEMI presentation in young adults",
      time: "8h ago",
      likes: 103,
      comments: 27,
    },
    {
      title: "Cardiology fellows debate post-MI rehab timelines",
      time: "11h ago",
      likes: 48,
      comments: 9,
    },
  ];

  useEffect(() => {
    if (promptFetchDoneRef.current) return;
    promptFetchDoneRef.current = true;

    const fetchPrompt = async () => {
      try {
        const token = await getToken({ template: "backend" });
        const response = await fetch(apiUrl("/engagement/prompts/next"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data) return;

        setPrompt(data as EngagementPrompt);
      } catch {
        // silent fail
      }
    };

    fetchPrompt();
  }, [getToken]);

  useEffect(() => {
    if (!prompt || isLoading || promptHandledRef.current) return;
    if (showPromptTimerRef.current) return;

    showPromptTimerRef.current = setTimeout(() => {
      setIsPromptOpen(true);
      showPromptTimerRef.current = null;
    }, 1400);

    return () => {
      if (showPromptTimerRef.current) {
        clearTimeout(showPromptTimerRef.current);
        showPromptTimerRef.current = null;
      }
    };
  }, [prompt, isLoading]);

  useEffect(() => {
    if (!isPromptOpen || !prompt || promptShownTrackedRef.current) return;
    promptShownTrackedRef.current = true;
    trackPromptEvent(prompt.id, "shown");
  }, [isPromptOpen, prompt]);

  const handlePromptOpenChange = (open: boolean) => {
    if (open) {
      setIsPromptOpen(true);
      return;
    }

    if (ignoreNextPromptCloseRef.current) {
      ignoreNextPromptCloseRef.current = false;
      setIsPromptOpen(false);
      return;
    }

    handlePromptDismissed();
  };

  const handlePromptDismissed = () => {
    if (!prompt || promptHandledRef.current) {
      setIsPromptOpen(false);
      return;
    }

    promptHandledRef.current = true;
    setIsPromptOpen(false);
    trackPromptEvent(prompt.id, "dismissed");
  };

  const handlePromptWritePost = () => {
    if (!prompt || promptHandledRef.current) return;

    promptHandledRef.current = true;
    ignoreNextPromptCloseRef.current = true;
    setIsPromptOpen(false);
    pendingPostedPromptIdRef.current = prompt.id;

    trackPromptEvent(prompt.id, "clicked_post");

    setComposerDraft({
      title: prompt.title,
      body: prompt.body,
      tags: prompt.suggested_tags ?? [],
    });
    setComposerOpen(true);
  };

  const handleComposerOpenChange = (open: boolean) => {
    setComposerOpen(open);
    if (!open) {
      setComposerDraft(null);
    }
  };

  const handlePostCreated = () => {
    const promptId = pendingPostedPromptIdRef.current;
    if (!promptId) return;

    pendingPostedPromptIdRef.current = null;
    trackPromptEvent(promptId, "posted");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-6 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="col-span-1">
          <div className="sticky top-24 h-fit">
            {isLoading ? (
              <UserSummaryCardSkeleton />
            ) : profile ? (
              <UserSummaryCard
                clerkId={profile.identity.clerk_id}
                name={profile.identity.name}
                avatar={profile.identity.avatar}
                specialization={profile.basic.specialization}
                hospital={profile.basic.hospital}
              />
            ) : null}
          </div>
        </div>

        {/* MAIN FEED */}
        <div className="col-span-3 space-y-6">
          <CreatePostCard
            avatarUrl={profile?.identity?.avatar}
            name={profile?.identity?.name}
            isComposerOpen={composerOpen}
            onComposerOpenChange={handleComposerOpenChange}
            composerInitialDraft={composerDraft ?? undefined}
            onPostCreated={handlePostCreated}
          />

          <FeedList />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-2 space-y-4">
          <section className="rounded-2xl border border-default-200 bg-white p-4">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900">Top posts</h3>
              <p className="text-sm text-gray-500">Trending in your network</p>
            </div>

            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div
                  key={post.title}
                  className={`rounded-xl px-2 py-1.5 transition hover:bg-default-50 ${
                    index !== topPosts.length - 1
                      ? "border-b border-default-100 pb-3"
                      : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {post.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {post.time} · {post.likes} likes · {post.comments} comments
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="sticky top-24 self-start p-4 text-xs text-gray-500">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span>About</span>
              <span>Accessibility</span>
              <span>Help Center</span>
              <span>Privacy & Terms</span>
              <span>Ad Choices</span>
              <span>Advertising</span>
              <span>Business Services</span>
              <span>Get the app</span>
            </div>
            <p className="mt-4 text-[11px] text-gray-400">
              Serona Corporation © 2026
            </p>
          </section>
        </div>
      </div>

      <EngagementPromptModal
        prompt={prompt}
        isOpen={isPromptOpen}
        onOpenChange={handlePromptOpenChange}
        onMaybeLater={handlePromptDismissed}
        onWritePost={handlePromptWritePost}
      />
    </div>
  );

  async function trackPromptEvent(promptId: number, eventType: PromptEventType) {
    try {
      const token = await getToken({ template: "backend" });
      await fetch(apiUrl(`/engagement/prompts/${promptId}/event`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_type: eventType }),
      });
    } catch {
      // silent fail
    }
  }
}
