"use client";

import { useState } from "react";
import AppNavbar from "@/components/layout/Navbar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 relative">
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
          className={`max-w-6xl mx-auto px-6 py-6 transition-all duration-300 ${
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
