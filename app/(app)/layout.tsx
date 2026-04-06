"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const AppNavbar = dynamic(() => import("@/components/layout/Navbar"), {
  ssr: false,
});

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const titleByRoute: Array<{ match: RegExp; title: string }> = [
      { match: /^\/feed$/, title: "Feed" },
      { match: /^\/connections(?:\/|$)/, title: "Connections" },
      { match: /^\/notifications(?:\/|$)/, title: "Notifications" },
      { match: /^\/posts\/[^/]+$/, title: "Post" },
      { match: /^\/search\/results\/all$/, title: "Search Results" },
      { match: /^\/search\/results\/content$/, title: "Search Content" },
      { match: /^\/u\/[^/]+\/posts$/, title: "Profile Posts" },
      { match: /^\/u\/[^/]+$/, title: "Profile" },
    ];

    const matched = titleByRoute.find((item) => item.match.test(pathname));
    const pageTitle = matched?.title ? `${matched.title} | Serona` : "Serona";
    document.title = pageTitle;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f6f9fb] relative">
      <AppNavbar onSearchFocusChange={setIsSearchFocused} />

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative min-h-full">
        {isSearchFocused && (
          <div
            className="absolute inset-0 bg-black/50 transition-all duration-300 z-40"
            onClick={() => setIsSearchFocused(false)}
          />
        )}

        <div
          className={`max-w-7xl mx-auto px-6 py-6 transition-all duration-300 ${
            isSearchFocused ? "pointer-events-none select-none" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
