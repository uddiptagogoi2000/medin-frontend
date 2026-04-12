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
  const topArticles = [
    {
      title:
        "The Entry of Technologies into Tuberculosis and Integrated Lung Health",
      href: "https://www.expresshealthcare.in/blogs/guest-blogs-healthcare/the-entry-of-technologies-into-tuberculosis-and-integrated-lung-health/453235/",
    },
    {
      title: "Caregiver Capital: The Invisible Workforce Powering Cancer Care",
      href: "https://www.expresshealthcare.in/news/caregiver-capital-the-invisible-workforce-powering-cancer-care/453122/",
    },
    {
      title:
        "Why Newborn Survival Varies Across States and What Better-performing States Are Doing Differently",
      href: "https://www.expresshealthcare.in/news/why-newborn-survival-varies-so-sharply-across-states-and-what-better-performing-states-are-doing-differently/453062/",
    },
    {
      title:
        "Unlocking the True Value of AI in Healthcare and Life Sciences: A Framework for Success",
      href: "https://www.expresshealthcare.in/news/unlocking-the-true-value-of-ai-in-healthcare-and-life-sciences-a-framework-for-success/453089/",
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
      title: prompt.body,
      body: "Write your thoughts here...",
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
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
            <div className="rounded-xl border border-dashed border-default-200 bg-default-50 px-3 py-5 text-sm text-gray-500">
              No top posts for now.
            </div>
          </section>

          <section className="rounded-2xl border border-default-200 bg-white p-4">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">
                Top articles on medical science
              </h3>
              {topArticles.map((article, index) => (
                <a
                  key={article.href}
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-xl px-2 py-1.5 transition hover:bg-default-50 ${
                    index !== topArticles.length - 1
                      ? "border-b border-default-100 pb-3"
                      : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                    {article.title}
                  </p>
                  <p className="mt-1 text-xs text-primary">Read article</p>
                </a>
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

  async function trackPromptEvent(
    promptId: number,
    eventType: PromptEventType,
  ) {
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
